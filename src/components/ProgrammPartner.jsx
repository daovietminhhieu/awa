import React, { useState } from "react";
import { useI18n } from "../i18n";
import { sendProgrammReview, sendProgrammQA } from "../api";
import "./ProgrammPartner.css";
import TranslatableText from "../TranslateableText";

export default function ProgrammPartner({ programm }) {
  const { t, lang } = useI18n();
  const id = programm?._id;

  const [reviews, setReviews] = useState(programm?.reviews || []);
  const [qaList, setQaList] = useState(
    Array.isArray(programm?.qa)
      ? programm.qa
      : Array.isArray(programm?.questions)
      ? programm.questions
      : []
  );

  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState(5);
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showQAForm, setShowQAForm] = useState(false);

  const [showReviews, setShowReviews] = useState(false);
  const [showQA, setShowQA] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert("Vui lòng nhập nội dung đánh giá!");
    setLoading(true);
    try {
      const res = await sendProgrammReview(id, { rate: Number(rate), content });
      if (res.success) {
        const newReview = res.data || { rate, content, createdAt: new Date() };
        setReviews((prev) => [newReview, ...prev]);
        setShowReviewForm(false);
        setContent("");
        setRate(5);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gửi đánh giá thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleQASubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return alert("Vui lòng nhập câu hỏi!");
    setLoading(true);
    try {
      const res = await sendProgrammQA(id, { question });
      if (res.success) {
        const newQA = res.data || { question, answer: null };
        setQaList((prev) => [newQA, ...prev]);
        setShowQAForm(false);
        setQuestion("");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Gửi câu hỏi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (num) => "⭐".repeat(num);

  return (
    <div className="partner-programm-container">
      {/* === Giới thiệu đối tác === */}
      <div className="partner-description">
        <h4>{t("programm.detail.partner.intro_title")}</h4>
        <p>{programm?.partner_description || "Đang cập nhật..."}</p>
      </div>

      {/* === Accordion: Đánh giá === */}
      <div className="accordion-section">
        <div
          className="accordion-header"
          onClick={() => setShowReviews(!showReviews)}
        >
          <h2>{t("programm.detail.partner.review.title")}</h2>
          <span>{showReviews ? "▲" : "▼"}</span>
        </div>

        {showReviews && (
          <div className="accordion-content">
            {reviews?.length > 0 ? (
              <ul className="review-list">
                {reviews.map((rev, idx) => (
                  <li key={idx} className="review-item">
                    <div className="review-header">
                      <div className="review-avatar">🧑</div>
                      <div>
                        <div className="review-name">
                          <TranslatableText text={rev.user?.name || "Người dùng ẩn danh"} lang={lang} />
                        </div>
                        <div className="review-stars">{renderStars(rev.rate)}</div>
                        {rev.createdAt && (
                          <small className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                          </small>
                        )}
                      </div>
                    </div>
                    <p className="review-content"><TranslatableText text={rev.content} lang={lang}/></p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("programm.detail.partner.review.empty") || "Chưa có đánh giá nào."}</p>
            )}

            <button className="footer-btn" onClick={() => setShowReviewForm(true)}>
              ➕ {t("programm.detail.partner.review.write")}
            </button>
          </div>
        )}
      </div>

      {/* === Accordion: Hỏi & Đáp === */}
      <div className="accordion-section">
        <div className="accordion-header" onClick={() => setShowQA(!showQA)}>
          <h2>{t("programm.detail.partner.qa.title")}</h2>
          <span>{showQA ? "▲" : "▼"}</span>
        </div>

        {showQA && (
          <div className="accordion-content">
            {qaList?.length > 0 ? (
              <ul className="qa-list">
                {qaList.map((q, idx) => (
                  <li key={idx} className="qa-item">
                    <p>
                      <b>{t("programm.detail.partner.qa.question_prefix")} </b>
                      {q.user?.name || "Khách"}: {q.question}
                    </p>
                    {q.answer && (
                      <p className="qa-answer">
                        {t("programm.detail.partner.qa.answer_prefix")} {q.answer}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("programm.detail.partner.qa.empty") || "Chưa có câu hỏi nào."}</p>
            )}
            <button className="footer-btn" onClick={() => setShowQAForm(true)}>
              💬 {t("programm.detail.partner.qa.button")}
            </button>
          </div>
        )}
      </div>

      {/* === MODAL FORM: REVIEW === */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("programm.detail.partner.review.write")}</h3>
            <form onSubmit={handleReviewSubmit}>
              <label>
                {t("programm.detail.partner.review.select_stars") || "Chọn số sao:"}
                <select
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  disabled={loading}
                >
                  {[5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>
                      {s} ⭐
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                placeholder={t("programm.detail.partner.review.placeholder") || "Chia sẻ trải nghiệm của bạn..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : t("programm.detail.partner.review.button") || "Gửi đánh giá"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowReviewForm(false)}
                >
                  {t("common.cancel") || "Hủy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL FORM: QA === */}
      {showQAForm && (
        <div className="modal-overlay" onClick={() => setShowQAForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("programm.detail.partner.qa.button")}</h3>
            <form onSubmit={handleQASubmit}>
              <textarea
                placeholder={t("programm.detail.partner.qa.placeholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : t("programm.detail.partner.qa.button")}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowQAForm(false)}
                >
                  {t("common.cancel") || "Hủy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
