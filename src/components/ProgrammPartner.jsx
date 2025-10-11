import React, { useState } from "react";
import { useI18n } from "../i18n";

export default function ProgrammPartner({ programm }) {
  const { t } = useI18n();
  const [question, setQuestion] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    alert(`${t("programm.detail.partner.qa.question_prefix")} ${question}`);
    setQuestion("");
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    alert(`${t("programm.detail.partner.review.stars")}: ${rating}\n${review}`);
    setReview("");
  };

  return (
    <div className="partner-programm-container">
      <h1 className="partner-programm-title">{t("programm.detail.partner.title")}</h1>

      {/* === THÔNG TIN CHUNG ĐỐI TÁC === */}
    

      {/* === MÔ TẢ ĐỐI TÁC === */}
      <div className="partner-description">
        <h4>{t("programm.detail.partner.intro_title")}</h4>
        <p>{programm.partner_description || "Đang cập nhật..."}</p>
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
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s} {t("programm.detail.partner.review.stars")}
                </option>
              ))}
            </select>
          </label>
          <textarea
            placeholder={t("programm.detail.partner.review.placeholder")}
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button type="submit" className="footer-btn">
            {t("programm.detail.partner.review.button")}
          </button>
        </form>
      </div>
    </div>
  );
}
