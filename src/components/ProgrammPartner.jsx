import React, { useState } from "react";
import { useI18n } from "../i18n";
import { sendProgrammReview, sendProgrammQA } from "../api";
import "./ProgrammPartner.css";

export default function ProgrammPartner({ programm }) {
  const { t } = useI18n();
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

  // === Gửi đánh giá ===
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

  // === Gửi câu hỏi ===
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
          <h2>Đánh giá của khách hàng</h2>
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
                          {rev.user?.name || "Người dùng ẩn danh"}
                        </div>
                        <div className="review-stars">{renderStars(rev.rate)}</div>
                        {rev.createdAt && (
                          <small className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                          </small>
                        )}
                      </div>
                    </div>
                    <p className="review-content">{rev.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có đánh giá nào.</p>
            )}

            <button className="footer-btn" onClick={() => setShowReviewForm(true)}>
              ➕ Viết đánh giá
            </button>
          </div>
        )}
      </div>

      {/* === Accordion: Hỏi & Đáp === */}
      <div className="accordion-section">
        <div className="accordion-header" onClick={() => setShowQA(!showQA)}>
          <h2>Hỏi & Đáp</h2>
          <span>{showQA ? "▲" : "▼"}</span>
        </div>

        {showQA && (
          <div className="accordion-content">
            {qaList?.length > 0 ? (
              <ul className="qa-list">
                {qaList.map((q, idx) => (
                  <li key={idx} className="qa-item">
                    <p>
                      <b>❓ {q.user?.name || "Khách"} hỏi:</b> {q.question}
                    </p>
                    {q.answer && <p className="qa-answer">💬 {q.answer}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có câu hỏi nào.</p>
            )}
            <button className="footer-btn" onClick={() => setShowQAForm(true)}>
              💬 Đặt câu hỏi
            </button>
          </div>
        )}
      </div>

      {/* === MODAL FORM: REVIEW === */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Viết đánh giá</h3>
            <form onSubmit={handleReviewSubmit}>
              <label>
                Chọn số sao:{" "}
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
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowReviewForm(false)}
                >
                  Hủy
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
            <h3>Đặt câu hỏi</h3>
            <form onSubmit={handleQASubmit}>
              <textarea
                placeholder="Nhập câu hỏi của bạn..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi câu hỏi"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowQAForm(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
