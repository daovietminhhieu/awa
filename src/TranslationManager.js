class TranslationManager {
  constructor() {
    this.queue = new Set();
    this.translations = {};
    this.timer = null;
    this.subscribers = new Map();
  }

  // Đăng ký text cần dịch
  requestTranslation(text, lang, callback) {
    const key = `${lang}:${text}`;
    if (this.translations[key]) {
      callback(this.translations[key]);
      return;
    }

    this.queue.add({ text, lang, callback });

    // Gom request trong 300ms
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 300);
    }
  }

  async flush() {
    const items = Array.from(this.queue);
    this.queue.clear();
    this.timer = null;
    if (items.length === 0) return;

    // Gom theo ngôn ngữ
    const grouped = {};
    items.forEach(({ text, lang, callback }) => {
      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push({ text, callback });
    });

    // Gọi API cho từng ngôn ngữ
    for (const lang in grouped) {
      const texts = grouped[lang].map((i) => i.text);
      try {
        const res = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=AIzaSyBlsGqWN60g-h4tysN9uox5iq1g0QAnV1E`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: texts, target: lang, format: "html" }),
          }
        );

        const data = await res.json();
        if (data?.data?.translations) {
          data.data.translations.forEach((t, i) => {
            const original = texts[i];
            const translated = t.translatedText;
            const key = `${lang}:${original}`;
            this.translations[key] = translated;

            const match = grouped[lang].find((it) => it.text === original);
            match?.callback(translated);
          });
        }
      } catch (err) {
        console.error("Translate error:", err);
        grouped[lang].forEach(({ text, callback }) => callback(text));
      }
    }
  }
}

export const translationManager = new TranslationManager();
