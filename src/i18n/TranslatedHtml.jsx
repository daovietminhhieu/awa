import { useEffect, useState } from "react";
import { translationManager } from "./TranslationManager";

export function TranslatedHtml({
  html,
  lang,
  className = "",
  isExpanded = false,
  maxLength = 400,
  showProgress = false, // Thêm prop để hiển thị tiến trình
  translateCollapsed = false,
}) {
  const [displayHtml, setDisplayHtml] = useState(html || "");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // Thêm state cho progress
  const [estimatedTime, setEstimatedTime] = useState(0);

  // Tạo preview đơn giản
  const createPreview = (htmlContent) => {
    if (!htmlContent) return "";

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || "";

    if (textContent.length <= maxLength) {
      return htmlContent;
    }

    const truncatedText = textContent.substring(0, maxLength) + "...";
    return truncatedText;
  };

  useEffect(() => {
    if (!html) {
      setDisplayHtml("");
      setError(null);
      setProgress(0);
      return;
    }

    let isMounted = true;
    let progressInterval;

    const processContent = () => {
      if (isExpanded) {
        // Chế độ mở rộng: dịch toàn bộ HTML
        setIsTranslating(true);
        setError(null);
        setProgress(10); // Bắt đầu với 10%

        // Ước tính thời gian dựa trên độ dài text
        const textLength = html.length;
        const estimatedTimeMs = Math.max(2000, Math.min(10000, textLength * 2));
        setEstimatedTime(Math.ceil(estimatedTimeMs / 1000));

        // Progress bar simulation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return 90; // Dừng ở 90% chờ kết quả
            return prev + Math.random() * 15;
          });
        }, 500);

        translationManager.requestTranslation(html, lang, (translatedHtml) => {
          if (isMounted) {
            clearInterval(progressInterval);
            setProgress(100); // Hoàn thành
            setDisplayHtml(translatedHtml);

            // Ẩn progress sau 1 giây
            setTimeout(() => {
              if (isMounted) {
                setIsTranslating(false);
                setProgress(0);
              }
            }, 1000);

            // Kiểm tra nếu dịch thất bại
            if (translatedHtml === html) {
              setError("");
            }
          }
        });
      } else {
        // Chế độ thu gọn
        if (translateCollapsed) {
          setIsTranslating(true);
          setError(null);
          setProgress(15);

          translationManager.requestTranslation(html, lang, (translatedHtml) => {
            const previewHtml = createPreview(translatedHtml);
            setDisplayHtml(previewHtml);
            setProgress(100);
            setTimeout(() => {
              setIsTranslating(false);
              setProgress(0);
            }, 300);

            if (translatedHtml === html) {
              setError("");
            }
          });
        } else {
          // Chỉ cắt ngắn, không dịch
          const previewHtml = createPreview(html);
          setDisplayHtml(previewHtml);
          setError(null);
          setProgress(0);
        }
      }
    };

    processContent();

    return () => {
      isMounted = false;
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [html, lang, isExpanded, maxLength, translateCollapsed, createPreview]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div dangerouslySetInnerHTML={{ __html: displayHtml }} />

      {/* UI HIỂN THỊ ĐANG DỊCH - CẢI TIẾN */}
      {isTranslating && showProgress && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
            zIndex: 10,
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "12px",
            }}
          ></div>

          {/* Progress bar */}
          <div
            style={{
              width: "80%",
              height: "6px",
              background: "#f0f0f0",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#007bff",
                transition: "width 0.3s ease",
                borderRadius: "3px",
              }}
            ></div>
          </div>

          {/* Text info */}
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              textAlign: "center",
            }}
          >
            <div>Đang dịch... {Math.round(progress)}%</div>
            {estimatedTime > 0 && (
              <div
                style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
              >
                Ước tính: {estimatedTime}s
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thông báo lỗi */}
      {error && (
        <div
          style={{
            color: "#ff6b35",
            fontSize: "12px",
            padding: "8px",
            background: "#fff3f3",
            border: "1px solid #ffd6d6",
            borderRadius: "4px",
            marginTop: "8px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default TranslatedHtml;
