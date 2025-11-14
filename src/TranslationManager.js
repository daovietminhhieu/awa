const API_URL = "https://alowork.com/api/translate";

class TranslationManager {
  constructor() {
    this.queue = new Map();
    this.translations = new Map();
    this.timer = null;
    this.DEBOUNCE_DELAY = 50; // Giảm delay để tăng tốc
    this.batchSize = 5; // Giảm batch size để tránh timeout
    this.concurrentRequests = 3; // Số request đồng thời
    this.retryCount = 2; // Số lần thử lại
  }

  getCacheKey(html, lang) {
    return `${lang}:${html}`;
  }

  async requestTranslation(html, lang, callback) {
    if (!html) {
      callback(html);
      return;
    }

    const key = this.getCacheKey(html, lang);

    // Cache nhớ kết quả
    if (this.translations.has(key)) {
      callback(this.translations.get(key));
      return;
    }

    if (!this.queue.has(key)) {
      this.queue.set(key, {
        html,
        lang,
        callbacks: new Set(),
      });
    }
    this.queue.get(key).callbacks.add(callback);

    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.DEBOUNCE_DELAY);
  }

  // 🔹 TĂNG TỐC: Xử lý đồng thời nhiều request
  async processBatch(batch) {
    const results = [];

    // Chia batch thành các nhóm nhỏ để xử lý đồng thời
    for (let i = 0; i < batch.length; i += this.concurrentRequests) {
      const chunk = batch.slice(i, i + this.concurrentRequests);
      const chunkPromises = chunk.map((item) => this.processItem(item));
      const chunkResults = await Promise.allSettled(chunkPromises);
      results.push(...chunkResults);

      // Thêm delay nhỏ giữa các chunk
      if (i + this.concurrentRequests < batch.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    return results;
  }

  async processItem({ html, lang, callbacks }) {
    try {
      // Kiểm tra cache một lần nữa (tránh race condition)
      const key = this.getCacheKey(html, lang);
      if (this.translations.has(key)) {
        const cached = this.translations.get(key);
        callbacks.forEach((cb) => cb(cached));
        return { success: true, key };
      }

      console.log("🚀 Translating HTML content");

      // Dùng phương pháp dịch thông minh hơn
      const translatedHTML = await this.translateWithRetry(html, lang);

      this.translations.set(key, translatedHTML);
      callbacks.forEach((cb) => cb(translatedHTML));

      return { success: true, key };
    } catch (error) {
      console.error("❌ Translation failed:", error);
      const key = this.getCacheKey(html, lang);
      this.translations.set(key, html);
      callbacks.forEach((cb) => cb(html));
      return { success: false, error, key };
    }
  }

  // 🔹 TĂNG TỐC: Thêm retry và timeout
  async translateWithRetry(html, lang, retry = 0) {
    try {
      return await this.translateHTMLWithTimeout(html, lang);
    } catch (error) {
      if (retry < this.retryCount) {
        console.log(`🔄 Retry ${retry + 1}/${this.retryCount}`);
        await new Promise((resolve) => setTimeout(resolve, 500 * (retry + 1)));
        return this.translateWithRetry(html, lang, retry + 1);
      }
      throw error;
    }
  }

  async translateHTMLWithTimeout(html, lang, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Translation timeout"));
      }, timeout);

      this.translateHTMLNodes(html, lang)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  // 🔹 TĂNG TỐC: Tối ưu hàm dịch HTML
  async translateHTMLNodes(html, lang) {
    // Nếu HTML ngắn, dịch luôn toàn bộ
    if (html.length < 100) {
      try {
        const translatedText = await this.translateText(html, lang);
        return translatedText; // Giả sử API trả về HTML đã dịch
      } catch (error) {
        // Fallback đến phương pháp cũ
        console.error("❌ Fallback translation failed:", error);
      }
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const textNodes = [];
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          return node.textContent.trim()
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      },
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    console.log(`Found ${textNodes.length} text nodes to translate`);

    // Dịch các text nodes song song
    const translationPromises = textNodes.map(async (textNode) => {
      const originalText = textNode.textContent;

      if (originalText.trim()) {
        try {
          const translatedText = await this.translateText(originalText, lang);
          const trimmedOriginal = originalText.trim();
          const trimmedTranslated = translatedText.trim();
          textNode.textContent = originalText.replace(
            trimmedOriginal,
            trimmedTranslated
          );
        } catch (error) {
          console.error(`Failed to translate: "${originalText}"`, error);
        }
      }
    });

    await Promise.allSettled(translationPromises);
    return tempDiv.innerHTML;
  }

  async translateText(text, lang) {
    console.log(`📤 Translating text: "${text}" to ${lang}`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        target_lang: lang,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.translations?.[0]?.text || text;
  }

  async flush() {
    if (this.queue.size === 0) return;

    const items = Array.from(this.queue.values());
    this.queue.clear();
    this.timer = null;

    console.log(`🔄 Flushing ${items.length} translation requests`);

    await this.processBatch(items);
  }

  clearCache() {
    this.translations.clear();
  }

  getCacheSize() {
    return this.translations.size;
  }

  // 🔹 TĂNG TỐC: Preload cache
  preloadTranslations(translations) {
    translations.forEach(({ html, lang, translatedHtml }) => {
      const key = this.getCacheKey(html, lang);
      this.translations.set(key, translatedHtml);
    });
  }
}

export const translationManager = new TranslationManager();
