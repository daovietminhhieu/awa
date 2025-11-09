import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import {
  sendProgrammReview,
  sendProgrammQA,
  getProgrammQAList,
  answerProgrammQA,
} from "../api";
import "./ProgrammPartner.css";
import TranslatableText from "../TranslateableText";
import { useAuth } from "../context/AuthContext";

export default function ProgrammPartner({ programm }) {
  const { t, lang } = useI18n();
  const id = programm?._id;

  const [reviews, setReviews] = useState(programm?.reviews || []);
  const [qaList, setQaList] = useState(Array.isArray(programm?.qa) ? programm.qa : []);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showQAForm, setShowQAForm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showQA, setShowQA] = useState(false);

  const [rate, setRate] = useState(5);
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");

  const [answerQAFormId, setAnswerQAFormId] = useState(null);
  const [answerText, setAnswerText] = useState("");

  // Fetch Q&A
  useEffect(() => {
    async function fetchQA() {
      if (!id) return;
      try {
        const res = await getProgrammQAList(id);
        if (res.success) setQaList(res.data);
      } catch (err) {
        console.error("fetchQA error:", err);
      }
    }
    fetchQA();
  }, [id]);

  // Submit review
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
      } else alert(res.message || "Gửi đánh giá thất bại!");
    } catch (err) {
      console.error("handleReviewSubmit error:", err);
      alert("Gửi đánh giá thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Submit question
  const handleQASubmit = async (e) => {
    e.preventDefault();
    const trimmedQuestion = question?.trim();
    if (!trimmedQuestion) return alert("Vui lòng nhập câu hỏi!");
    setLoading(true);
    try {
      const payload = {
        question: trimmedQuestion,
        userId: user?._id || null,
        userName: user?.name || "Guest",
      };
      const res = await sendProgrammQA(id, payload);
      if (res.success) {
        const newQA = res.data || { question: trimmedQuestion, answer: null, userName: payload.userName };
        setQaList((prev) => [newQA, ...prev]);
        setShowQAForm(false);
        setQuestion("");
      } else alert(res.message || "Gửi câu hỏi thất bại!");
    } catch (err) {
      console.error("handleQASubmit error:", err);
      alert("Gửi câu hỏi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Submit answer
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return alert("Vui lòng nhập câu trả lời!");
    setLoading(true);
    try {
      console.log("programmId:", id);
      console.log("qaId:", answerQAFormId);
      const res = await answerProgrammQA(id, answerQAFormId, { answer: answerText });
      console.log("Response from API:", res); // Log API response
      if (res.success) {
        setQaList((prev) => prev.map((q) => (q._id === answerQAFormId ? res.data : q)));
        setAnswerQAFormId(null);
        setAnswerText("");
      } else {
        alert(res.message || "Gửi câu trả lời thất bại!");
      }
    } catch (err) {
      console.error("handleAnswerSubmit error:", err);
      alert("Gửi câu trả lời thất bại!");
    } finally {
      setLoading(false);
    }
  };
  

  const renderStars = (num) => "⭐".repeat(num);
  const handleShowAnswerForm = (qaId) => {
    setAnswerQAFormId(qaId);
    setAnswerText("");
  };

  return (
    <div className="partner-programm-container">
      <div className="partner-description">
        <h4>{t("programm.detail.partner.intro_title")}</h4>
        <p>{programm?.partner_description || "Đang cập nhật..."}</p>
      </div>

      {/* Accordion: Reviews */}
      <div className="accordion-section">
        <div className="accordion-header" onClick={() => setShowReviews(!showReviews)}>
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
                    <p className="review-content">
                      <TranslatableText text={rev.content} lang={lang} />
                    </p>
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

      {/* Accordion: Q&A */}
      <div className="accordion-section">
        <div className="accordion-header" onClick={() => setShowQA(!showQA)}>
          <h2>{t("programm.detail.partner.qa.title")}</h2>
          <span>{showQA ? "▲" : "▼"}</span>
        </div>

        {showQA && (
          <div className="accordion-content">
            {qaList?.length > 0 ? (
              <ul className="qa-fb-list">
              {qaList.map((q) => (
                <li key={q._id} className="qa-fb-item">
                  <div className="qa-fb-avatar">🧑</div>
                  <div className="qa-fb-body">
                    <div className="qa-fb-content">
                      <span className="qa-fb-name">{q.userName || "Guest"}</span>
                      <p className="qa-fb-text">{q.question}</p>
                    </div>
                    <div className="qa-fb-meta">
                      <span className="qa-fb-time">
                        {new Date(q.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      {user?.role &&
                        ["admin", "recruiter"].includes(user.role) &&
                        !q.answer && (
                          <button
                            className="qa-fb-reply"
                            onClick={() => handleShowAnswerForm(q._id)}
                          >
                            Trả lời
                          </button>
                        )}
                    </div>
            
                    {/* Nếu có câu trả lời */}
                    {q.answer && (
                      <div className="qa-fb-reply-thread">
                        <div className="qa-fb-avatar reply">🏢</div>
                        <div className="qa-fb-body reply">
                          <div className="qa-fb-content reply">
                            <span className="qa-fb-name">BizSolutions Group</span>
                            <p className="qa-fb-text">{q.answer}</p>
                          </div>
                          <div className="qa-fb-meta">
                            <span className="qa-fb-time">Đã trả lời</span>
                            <span>{new Date(q.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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

      {/* Modal hỏi & đánh giá giữ nguyên */}
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
                placeholder={
                  t("programm.detail.partner.review.placeholder") ||
                  "Chia sẻ trải nghiệm của bạn..."
                }
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
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal trả lời câu hỏi */}
      {answerQAFormId && (
        <div className="modal-overlay" onClick={() => setAnswerQAFormId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Trả lời câu hỏi</h3>
            <form onSubmit={handleAnswerSubmit}>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                disabled={loading}
              />
              <div className="form-actions">
                <button type="submit" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi câu trả lời"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setAnswerQAFormId(null)}
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
