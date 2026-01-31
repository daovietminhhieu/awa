import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getProgrammBySlug } from "../../../api";
import "./Detail.css";
import { useI18n } from "../../../i18n";
import TranslateableText from "../../../i18n/TranslateableText.jsx";
import ApplicationForm from "../../CandidatesExternSystemApply.jsx"
import { useAuth } from "../../../context/AuthContext";
import { getProgrammById, sendProgrammReview, sendProgrammQA, getProgrammQAList, answerProgrammQA, getPostById, requestASharedLink, getProgrammCosts, addProgrammCost, updateProgrammCost, deleteProgrammCost, getProgrammDocuments, addProgrammDocument, updateProgrammDocument, deleteProgrammDocument, getProgrammSteps, addProgrammStep, updateProgrammStep, deleteProgrammStep } from "../../../api";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import TranslatedHtml from "../../../i18n/TranslatedHtml.jsx";

export default function ProgrammDetail({ role }) {
  const { slug } = useParams(); // Đổi từ id thành slug
  const {state} = useLocation();

  const programId = state?.programId;
  const programFromState = state?.program;
  
  
  const [programm, setProgramm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n();
  const { user } = useAuth();
  const referralId = new URLSearchParams(window.location.search).get("ref");

  useEffect(() => {
    async function fetchProgramm() {
      try {
        if (!slug) {
          throw new Error(t("programm.detail.slug_required"));
        }
        console.log(programId);
        const res = await getProgrammById(programId); // Sử dụng hàm mới
        if (!res.success) throw new Error(t("programm.detail.not_found"));
        setProgramm(res.data);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải thông tin chương trình");
      } finally {
        setLoading(false);
      }
    }
    fetchProgramm();
  }, [slug, t]);

  if (loading)
    return (
      <div className="programm-loading">
        {t("programm.detail.loading_programm")}
      </div>
    );

  if (error)
    return (
      <div className="programm-loading" style={{ color: "red" }}>
        ❌ {error} {console.log(programId)}
      </div>
    );

  if (!programm)
    return (
      <div className="programm-loading">
        {t("programm.detail.programm_not_found")}
      </div>
    );

  return (
    <div>
      <div className="programm-map-layout">
        {/* === CỘT TRÁI: Q&A + Reviews === */}
        <aside className="programm-left-panel">
          <ProgrammPartner programm={programm} currentUser={role}/>
          
        {!role  && (
          <ApplicationForm progId={programm.id} referralId={referralId}/>
          )}
        </aside>

        {/* === CỘT PHẢI: Thông tin chương trình === */}
        <main className="programm-right-panel">
          <ProgrammOverview programm={programm} role={role} />
          <ProgrammJourney program={programm} />
        </main>
        
      </div>
    </div>
  );
}

 

function ProgrammPartner({ programm }) {
  const { t, lang } = useI18n();
  const id = programm?.id;

  const [reviews, setReviews] = useState(programm?.reviews || []);
  const [qaList, setQaList] = useState(Array.isArray(programm?.questions) ? programm.questions : []);
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


  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert("Vui lòng nhập nội dung đánh giá!");
    setLoading(true);
    console.log(id);
    const userId = user? user._id:null;
    try {
      const res = await sendProgrammReview(id, { userId, rate: Number(rate), content });
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
      const payload = {
        questionId: answerQAFormId,
        answer: answerText,
        userId: user?._id || null,
        userName: user?.name || "Admin",
      };

      const res = await answerProgrammQA(id, payload);

      if (res.success) {
        setQaList(prev =>
          prev.map(q => (q.id === answerQAFormId ? res.data : q))
        );
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
      {/* <div className="partner-description">
        <h4>{t("programm.detail.partner.intro_title")}</h4>
        <p>{programm?.partner_description}</p>
      </div> */}
      {console.log(programm.id)}
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
                      <div className="review-name">
                          <TranslateableText text={rev.user || "Người dùng ẩn danh"} lang={lang} />
                        </div>
                      <div>
                      </div>
                    </div>
                    <p className="review-content">
                      <TranslateableText text={rev.content} lang={lang} />
                    </p>
                    <div className="review-stars">{renderStars(rev.rate)}</div>
                        {rev.createdAt && (
                          <small className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                          </small>
                        )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t("programm.detail.partner.review.no_review") || "Chưa có đánh giá nào."}</p>
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
              {console.log(qaList)}
              {qaList.map((q) => (
                
                <li key={q._id} className="qa-fb-item">
                  <div className="qa-header">
                    <div className="qa-avatar">🧑</div>
                    <span className="qa-name">{q.user || "Guest"}</span>
                  </div>
                  <div className="qa-fb-body">
                    <div className="qa-fb-content">
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
                            onClick={() => handleShowAnswerForm(q.id)}
                          >
                            {t('programm.detail.partner.qa.reply')}
                          </button>
                        )}
                    </div>
            
                    {/* Nếu có câu trả lời */}
                    {q.answer && (
                      <div className="qa-fb-reply-thread">
                        <div className="qa-fb-avatar reply">🏢</div>
                        <div className="qa-fb-body reply">
                          <div className="qa-fb-content reply">
                            <span className="qa-fb-name">{q.answeredByName}</span>
                            <p className="qa-fb-text">{q.answer}</p>
                          </div>
                          <div className="qa-fb-meta">
                            <span className="qa-fb-time">{t('programm.detail.partner.replied')}</span>
                            <span>{new Date(q.answeredAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            
            
            ) : (
              <p>{t("programm.detail.partner.qa.no_answer") || "Chưa có câu hỏi nào."}</p>
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
                  {loading ? t('programm.detail.partner.review.sending') : t('programm.detail.partner.review.send_review')}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowReviewForm(false)}
                >
                  {t('programm.detail.partner.review.cancel')}
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
                  {loading ? t('programm.detail.partner.review.sending'): t("programm.detail.partner.qa.button")}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowQAForm(false)}
                >
                 {t('programm.detail.partner.review.cancel')}
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
 


function ProgrammTags({ tags, lang }) {
  const renderTags = (list) => (
    list.map((tag, idx) => (
      <span
        key={idx}
        className="tag"
        style={{ background: tag.bg || "rgba(0,0,0,0.05)" }}
      >
        <b><TranslateableText text={tag.label} lang={lang}/>:</b> <TranslateableText text={tag.value} lang={lang} />
      </span>
    ))
  );

  return (
    <div className="programm-tags-slider auto">
      <div className="tags-track">
        {renderTags(tags)}
        {renderTags(tags)}
      </div>
    </div>
  );
}

function ProgrammHeader({ programm, role, t, lang }) {
  const tags = [
    { label: t("programm.detail.overview.duration"), value: programm.duration },
    { label: t("programm.detail.overview.degrees"), value: programm.degrees },
    {
      label: t("programm.detail.overview.type_category"),
      value:
        programm.type_category === "job"
          ? t("programm.detail.overview.job")
          : t("programm.detail.overview.studium"),
    },
    { label: t("programm.detail.overview.type"), value: programm.type },
    {
      label:
        programm.type_category === "job"
          ? t("programm.detail.overview.expected_salary")
          : t("programm.detail.overview.fee"),
      value:
        programm.type_category === "job"
          ? programm.expected_salary
          : programm.fee,
    },
    {
      label: t("programm.detail.overview.status"),
      value:
        programm.completed === "true"
          ? t("programm.detail.overview.enough")
          : t("programm.detail.overview.hire"),
    },
    {
      label: t("programm.detail.overview.public_day"),
      value: new Date(programm.public_day).toLocaleDateString(),
    },
    {
      label: t("programm.detail.overview.deadline"),
      value: new Date(programm.deadline).toLocaleDateString(),
    },
  ];

  const specialTags = [];
  if ((role === "recruiter" || role === "admin") && programm.bonus)
    specialTags.push({
      label: t("programm.detail.overview.bonus"),
      value: programm.bonus,
      bg: "#ff9800",
    });
  if (programm.vacancies)
    specialTags.push({
      label: t("programm.detail.overview.vacancies"),
      value: programm.vacancies,
      bg: "#4caf50",
    });
  if (programm.hired)
    specialTags.push({
      label: t("programm.detail.overview.hired"),
      value: programm.hired,
      bg: "#4caf50",
    });

  return (
    <div className="overview-header">
      <h1 className="programm-detail-title">
        <TranslateableText text={programm.name} lang={lang} />
      </h1>
      <ProgrammTags tags={tags} lang={lang} />
      {specialTags.length > 0 && (
        <div className="programm-tags-special">
          {specialTags.map((tag, idx) => (
            <span key={idx} className="tag" style={{ '--tag-bg': tag.bg }}>
              <b>{tag.label}:</b> {tag.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgrammInfoBoxes({ programm, currentUser, t, lang }) {
  const {user} = useAuth();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copiedLink, setCopiedLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  async function robustCopy(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) { void e; }
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { void e; }

    return false;
  }

  const handleShareClick = async () => {
    console.log(user);
    console.log(programm);
    try {
      setShowSharePopup(true);
      setCopiedLink("");
      setIsGeneratingLink(true);

      const res = await requestASharedLink(programm.id, user._id);
      let link = res.data.link;

      if (!/^https?:\/\//i.test(link)) {
        link = `${window.location.origin}${link}`;
      }

      setCopiedLink(link);
      setIsGeneratingLink(false);

      const success = await robustCopy(link);
      if (!success) {
        console.warn("Automatic copy failed, user can copy manually from popup");
      }
    } catch (err) {
      console.error(err);
      setCopiedLink("");
      setIsGeneratingLink(false);
      alert(t("recruiter.programms.share_failed", "Không thể tạo liên kết chia sẻ!"));
      setShowSharePopup(false);
    }
  };

  const handleManualCopy = async (link) => {
    const success = await robustCopy(link);
    if (success) {
      alert(t("recruiter.programms.link_copied", "Liên kết đã được sao chép!"));
    } else {
      alert(t("recruiter.programms.copy_failed", "Không thể sao chép. Vui lòng thử lại."));
    }
  };

  const handleInputCopy = (e) => {
    e.stopPropagation();
  
    /** @type {HTMLInputElement} */
    const input = e.target;
  
    input.select();
    document.execCommand("copy");
    alert(t("recruiter.programms.link_copied", "Liên kết đã được sao chép!"));
  };
  
  

  return (
    <div className="programm-info-boxes">
      <div className="info-box">
        <b>{t("programm.detail.overview.company")}:</b> {programm.company}
      </div>
      <div className="info-box">
        <b>{t("programm.detail.overview.land")}:</b> {programm.country}
      </div>
      {currentUser?.role === "recruiter" && (
        <div className="info-box" style={{ position: "relative" }}>
          <b>{t("programm.detail.overview.share_title") || "Chia sẻ chương trình"}:</b>
          <p
            style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}
            onClick={handleShareClick}
          >
            {t("programm.detail.overview.share_action") || "Bấm để chia sẻ"}
          </p>

          {showSharePopup && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                position: "absolute",
                top: "60px",
                left: "0",
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
                zIndex: 30,
                minWidth: "280px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {isGeneratingLink ? (
                <p style={{ margin: "0", fontSize: "14px" }}>
                  ⏳ {t("recruiter.programms.generating_link", "Đang tạo liên kết...")}
                </p>
              ) : (
                <>
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                    ✅ {t("recruiter.programms.link_ready", "Liên kết đã sẵn sàng")}
                  </p>

                  <div
                    style={{
                      background: "#f9f9f9",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      padding: "8px",
                      marginBottom: "10px",
                      wordBreak: "break-all",
                    }}
                  >
                    <input
                      type="text"
                      value={copiedLink}
                      readOnly
                      onClick={handleInputCopy}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        fontSize: "12px",
                        cursor: "pointer",
                        padding: "0",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>

                  <p style={{ fontSize: "12px", color: "#666", margin: "0 0 10px 0" }}>
                    {t("recruiter.programms.tap_to_copy", "Nhấn để sao chép")}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleManualCopy(copiedLink); }}
                      className="icon-btn primary"
                      title={t("recruiter.programms.copy", "Sao chép")}
                      style={{ flex: 1 }}
                    >
                      <FaCopy />
                    </button>

                    <a
                      href={copiedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="icon-btn"
                      title={t("recruiter.programms.open", "Mở")}
                      style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <FaExternalLinkAlt />
                    </a>

                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSharePopup(false); setCopiedLink(""); }}
                      className="icon-btn danger"
                      title={t("recruiter.programms.close", "Đóng")}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgrammSection({ title, content }) {
  const safeContent = Array.isArray(content) ? content : [content];
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {safeContent.filter(Boolean).map((line, idx) => (
          <li key={idx}>
            <p>{line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const renderHTML = (html) => {
  if (!html) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function ProgrammOverview({ programm, role, to }) {
  const { t, lang } = useI18n();
  const { user: currentUser } = useAuth();
  const [postTitles, setPostTitles] = useState([]);

  const stripHTML = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    const fetchPostTitles = async () => {
      try {
        if (programm.details?.other?.length > 0) {
          const postIds = programm.details.other;
          const postPromises = postIds.map((postId) => getPostById(postId));
          const responses = await Promise.all(postPromises);

          const titles = responses
            .filter((response) => response.success && response.data)
            .map((response) => ({
              _id: response.data._id,
              title: response.data.title,
              excerpt:
                stripHTML(
                  response.data.excerpt || response.data.content
                ).slice(0, 100) + "...",
              thumbnail: response.data.thumbnail || response.data.coverImage || null,
              type_category: response.data.type_category || "tip",
            }));

          setPostTitles(titles);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPostTitles();
  }, [programm]);

  return (
    <section className="programm-overview">
      <ProgrammHeader programm={programm} role={role} t={t} lang={lang} />

      <ProgrammInfoBoxes
        programm={programm}
        currentUser={currentUser}
        t={t}
        lang={lang}
      />

      <div className="overview-grid">
        <div className="overview-card">
          <h2>{t("programm.detail.overview.overview")}</h2>
          <div className="pre-line">
            {/* <TranslateableText
              text={
                programm.overviews ||
                t("programm.detail.no_description")
              }
              lang={lang}
            /> */}
          {/* {renderHTML(programm.overviews)} */}
          <TranslatedHtml 
              html={programm.overviews}
              lang={lang}
              isExpanded={true}
              className="detail-content ql-editor"
          />
          </div>
        </div>

        <div className="overview-card">
          <h2>{t("programm.detail.overview.requirements")}</h2>
          <TranslatedHtml 
              html={programm.requirements}
              lang={lang}
              isExpanded={true}
              className="detail-content ql-editor"
          />
              
        </div>

        <div className="overview-card">
          <h2>{t("programm.detail.overview.benefit")}</h2>
          <div className="pre-line">
          <TranslatedHtml 
              html={programm.benefits}
              lang={lang}
              isExpanded={true}
              className="detail-content ql-editor"
          />
          
          </div>
        </div>

        <div className="overview-card">
          <h2>{t("programm.detail.overview.other")}</h2>
          {programm.posts.map(p=>(
            <span style={{marginLeft:20}}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
 

// Hook để theo dõi chiều rộng màn hình
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

function ProgrammJourney({ program }) {
  const { t,lang } = useI18n();
  const { user } = useAuth();

  const width = useWindowWidth();
  const isMobile = width <= 600;





  // === INLINE STYLE ===
  const listItemStyle = {
    flex: "1 1 100%",
    borderRadius: "6px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
  };

  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thTdStyle = { border: "1px solid #ddd", padding: "8px", textAlign: "left" };
  const mobileCostRowStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    marginBottom: "12px",
    display: "flex",
    justifyContent:"center",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  };

  const addDiv = {
    width:"100%",
    marginTop:20,
    display:"flex",
    justifyContent:"space-between",
    gap: 8,
    boxSizing: "border-box",
  }

  return (
    <div className="programm-journey">
      {/* STEPS */}
      <section>
        <h2>Roadmaps: </h2>
          <TranslatedHtml 
              html={program.roadmaps}
              lang={lang}
              isExpanded={true}
              className="detail-content ql-editor"
          />
      </section>

      <div style={{ height: 30 }}></div>

      {/* DOCUMENTS */}
      <section>
        <h2>Documents</h2>
          <TranslatedHtml 
              html={program.documents}
              lang={lang}
              isExpanded={true}
              className="detail-content ql-editor"
          />
      </section>

      <div style={{ height: 30 }}></div>

      {/* COST TABLE */}
      <section>
        <h2>Costs</h2>
        <TranslatedHtml 
            html={program.costs}
            lang={lang}
            isExpanded={true}
            className="detail-content ql-editor"
        />
        
      </section>

     
    </div>
  );
}