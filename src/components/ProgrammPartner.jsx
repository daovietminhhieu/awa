import React, { useState } from "react";
import { useI18n } from "../i18n";
import { sendProgrammReview } from "../api";

export default function ProgrammPartner({ programm }) {
  const { t } = useI18n();

  // State quản lý câu hỏi và đánh giá
  const [question, setQuestion] = useState("");
  const [content, setContent] = useState(""); // Đổi từ 'review' → 'content' để khớp backend
  const [rate, setRate] = useState(5);
  const [loading, setLoading] = useState(false);

  const id = programm?._id;

  // --- Xử lý gửi câu hỏi ---
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert("Vui lòng nhập câu hỏi!");
      return;
    }
    alert(`${t("programm.detail.partner.qa.question_prefix")} ${question}`);
    setQuestion("");
  };

  // --- Xử lý gửi review ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    setLoading(true);
    console.log("📤 Program ID:", id);

    try {
      const payload = {
        rate: Number(rate),
        content, // 👈 gửi đúng field backend mong đợi
      };

      const res = await sendProgrammReview(id, payload);
      console.log("✅ Review added:", res);

      alert(
        `${t("programm.detail.partner.review.stars")}: ${rate}\n${content}`
      );

      // Reset form
      setContent("");
      setRate(5);
    } catch (err) {
      console.error("❌ Error adding review:", err);
      alert("Cập nhật đánh giá thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-programm-container">
      <h1 className="partner-programm-title">
        {t("programm.detail.partner.title")}
      </h1>

      {/* === MÔ TẢ ĐỐI TÁC === */}
      <div className="partner-description">
        <h4>{t("programm.detail.partner.intro_title")}</h4>
        <p>{programm?.partner_description || "Đang cập nhật..."}</p>
      </div>

      {/* === FORM HỎI ĐÁP === */}
      <div className="partner-reviews-container">
        <h2>{t("programm.detail.partner.qa.title")}</h2>
        <form onSubmit={handleQuestionSubmit} className="review-form">
          <textarea
            placeholder={t("programm.detail.partner.qa.placeholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" className="footer-btn">
            {t("programm.detail.partner.qa.button")}
          </button>
        </form>
      </div>

      {/* === FORM ĐÁNH GIÁ === */}
      <div className="partner-reviews-container">
        <h2>{t("programm.detail.partner.review.title")}</h2>
        <form onSubmit={handleReviewSubmit} className="review-form">
          <label>
            {t("programm.detail.partner.review.select_label")}{" "}
            <select
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              disabled={loading}
            >
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s} {t("programm.detail.partner.review.stars")}
                </option>
              ))}
            </select>
          </label>

          <textarea
            placeholder={t("programm.detail.partner.review.placeholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />

          <button type="submit" className="footer-btn" disabled={loading}>
            {loading
              ? t("programm.detail.partner.review.submitting")
              : t("programm.detail.partner.review.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
