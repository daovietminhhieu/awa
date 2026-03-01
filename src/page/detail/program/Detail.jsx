import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { getProgrammBySlug } from "../../../api";
import "./Detail.css";
import { useI18n } from "../../../i18n";
import TranslateableText from "../../../i18n/TranslateableText.jsx";
import ApplicationForm from "../../CandidatesExternSystemApply.jsx"
import { useAuth } from "../../../context/AuthContext";
import { getProgrammById, sendProgrammReview, sendProgrammQA, getProgrammQAList, answerProgrammQA, getPostById, requestASharedLink, getMyProfile, trackReferralClick } from "../../../api";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import TranslatedHtml from "../../../i18n/TranslatedHtml.jsx";
import TranslateText from "../../../i18n/TranslateableText.jsx";
import { slideUp, scrollReveal, tabSwitch } from "../../../utils/animations.js";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

export default function ProgrammDetail({ role }) {
  const { slug } = useParams(); // Đổi từ id thành slug
  const {state} = useLocation();

  const programId = state?.programId;
  const programFromState = state?.program;
  
  const [activeTab, setActiveTab] = useState("comments"); // Tab: comments | activity
  const { search } = useLocation();
  
  // Animation refs
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const tabContentRef = useRef(null);

  const params = new URLSearchParams(search);
  const ref = params.get("ref");
  const p = params.get("p");

  useEffect(() => {
    if (!ref) return;
    try {
      const cookieName = "awa_ref";
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${cookieName}=${ref};path=/;expires=${expires};SameSite=Lax`;
    } catch (e) {
      console.warn("Could not set referral cookie", e);
    }

    // call server to record click (non-blocking)
    try {
      trackReferralClick(ref);
    } catch (e) {
      // ignore
    }
  }, [ref]);
  
  const [programm, setProgramm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProgramm() {
      try {
        if (!slug) {
          throw new Error(t("programm.detail.slug_required"));
        }
        const res = await getProgrammById(p || programId); // Sử dụng hàm mới
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

  // Animate on successful load
  useEffect(() => {
    if (!loading && programm && containerRef.current) {
      // Animate left and right panels with stagger
      slideUp(leftPanelRef.current, { delay: 0, duration: 0.6 });
      slideUp(rightPanelRef.current, { delay: 0.2, duration: 0.6 });
    }
  }, [loading, programm]);

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
      {/* MAIN LAYOUT */}
      <div className="programm-detail-container" ref={containerRef}>
        {/* === CỘT PHẢI: Thông tin chương trình === */}
        <main className="programm-right-panel" ref={rightPanelRef}>
          <ProgrammOverview
            programm={programm}
            role={role}
          />
        </main>
                {/* === CỘT PHẢI: Tabs + Form === */}
        <aside className="programm-left-panel" ref={leftPanelRef}>
          {/* TAB NAVIGATION */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("comments");
                if (tabContentRef.current) {
                  tabSwitch(tabContentRef.current, { duration: 0.3 });
                }
              }}
            >
              💬 Reviews
            </button>
            <button 
              className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("activity");
                if (tabContentRef.current) {
                  tabSwitch(tabContentRef.current, { duration: 0.3 });
                }
              }}
            >
              ❓ Questions/Answers
            </button>
          </div>

          {/* TAB CONTENT: COMMENTS (Reviews) */}
          {activeTab === "comments" && (
            <div ref={tabContentRef}>
              <ProgrammReviews programm={programm} />
            </div>
          )}

          {/* TAB CONTENT: ACTIVITY (Q&A) */}
          {activeTab === "activity" && (
            <div ref={tabContentRef}>
              <ProgrammQA programm={programm} />
            </div>
          )}

          {/* APPLY FORM */}
          {!role && (
            <ApplicationForm progId={programm.id} referralId={ref} />
          )}
        </aside>
      </div>
    </div>
  );

}

function ProgrammReviews({ programm }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const id = programm?.id;

  const [reviews, setReviews] = useState(programm?.reviews || []);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rate, setRate] = useState(5);
  const [content, setContent] = useState("");
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      const ids = reviews
        .map((r) => r.userId || r.user)
        .filter((id) => id && !userMap[id]);

      if (ids.length === 0) return;

      try {
        const responses = await Promise.all(
          ids.map((id) => getMyProfile(id))
        );

        const nextMap = {};
        responses.forEach((res) => {
          const u = res?.data;
          if (u?._id) {
            nextMap[String(u._id)] = u;
          }
        });

        setUserMap((prev) => ({ ...prev, ...nextMap }));
      } catch (e) {
        console.error("Load users failed", e);
      }
    };

    loadUsers();
  }, [reviews, userMap]);

  const getUserName = (userId) => {
    if (!userId) return "Ẩn danh";
    return userMap[userId]?.name || "User";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert("Vui lòng nhập nội dung đánh giá!");

    setLoading(true);
    try {
      const res = await sendProgrammReview(id, {
        userId: user?._id || null,
        rate: Number(rate),
        content,
      });

      if (res.success) {
        const newReview = res.data || {
          userId: user?._id,
          rate,
          content,
          createdAt: new Date(),
        };
        setReviews((prev) => [newReview, ...prev]);
        setShowForm(false);
        setContent("");
        setRate(5);
      } else {
        alert(res.message || "Gửi đánh giá thất bại!");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      alert("Gửi đánh giá thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (num) => "⭐".repeat(num);

  return (
    <div className="reviews-modal">
      <h2>⭐ Reviews</h2>

      {reviews.length > 0 ? (
        <ul className="review-list">
          {reviews.map((rev, idx) => (
            <li key={idx} className="review-item">
              <div className="review-header">
                <strong>{getUserName(rev.userId || rev.user)}</strong>
                <small className="review-date">
                  {rev.createdAt
                    ? new Date(rev.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </small>
              </div>
              <div className="review-rating">{renderStars(rev.rate)}</div>
              <p className="review-content">{rev.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data">Chưa có đánh giá nào.</p>
      )}

      {!showForm ? (
        <button className="btn-add" onClick={() => setShowForm(true)}>
          ➕ Viết đánh giá
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <label>
            Chọn số sao:
            <select value={rate} onChange={(e) => setRate(e.target.value)} disabled={loading}>
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
            rows="4"
          />
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-cancel"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ProgrammQA({ programm }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const id = programm?.id;

  const [qaList, setQaList] = useState(
    Array.isArray(programm?.questions) ? programm.questions : []
  );
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answerFormId, setAnswerFormId] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      const ids = qaList
        .flatMap((q) => [q.user, q.answeredBy])
        .filter((id) => id && !userMap[id]);

      if (ids.length === 0) return;

      try {
        const responses = await Promise.all(
          ids.map((id) => getMyProfile(id))
        );

        const nextMap = {};
        responses.forEach((res) => {
          const u = res?.data;
          if (u?._id) {
            nextMap[String(u._id)] = u;
          }
        });

        setUserMap((prev) => ({ ...prev, ...nextMap }));
      } catch (e) {
        console.error("Load users failed", e);
      }
    };

    loadUsers();
  }, [qaList, userMap]);

  const getUserName = (userId) => {
    if (!userId) return "Ẩn danh";
    return userMap[userId]?.name || "User";
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return alert("Vui lòng nhập câu hỏi!");

    setLoading(true);
    try {
      const res = await sendProgrammQA(id, {
        question: question.trim(),
        userId: user?._id || null,
        userName: user?.name || "Guest",
      });

      if (res.success) {
        const newQA = res.data || {
          id: Date.now(),
          user: user?._id,
          question: question.trim(),
          answer: null,
          createdAt: new Date(),
        };
        setQaList((prev) => [newQA, ...prev]);
        setShowForm(false);
        setQuestion("");
      } else {
        alert(res.message || "Gửi câu hỏi thất bại!");
      }
    } catch (err) {
      console.error("Submit question error:", err);
      alert("Gửi câu hỏi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return alert("Vui lòng nhập câu trả lời!");

    setLoading(true);
    try {
      const res = await answerProgrammQA(id, {
        questionId: answerFormId,
        answer: answerText.trim(),
        userId: user?._id || null,
        userName: user?.name || "Admin",
      });

      if (res.success) {
        setQaList((prev) =>
          prev.map((q) => (q.id === answerFormId ? res.data : q))
        );
        setAnswerFormId(null);
        setAnswerText("");
      } else {
        alert(res.message || "Gửi câu trả lời thất bại!");
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      alert("Gửi câu trả lời thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qa-modal">
      <h2>💬 Questions & Answers</h2>

      {qaList.length > 0 ? (
        <ul className="qa-list">
          {qaList.map((q) => (
            <li key={q.id} className="qa-item">
              <div className="qa-question">
                <strong>{getUserName(q.user)}</strong>
                <small className="qa-date">
                  {q.createdAt
                    ? new Date(q.createdAt).toLocaleDateString("vi-VN")
                    : ""}
                </small>
              </div>
              <p className="qa-question-text">{q.question}</p>

              {q.answer ? (
                <div className="qa-answer">
                  <div className="qa-answer-header">
                    <strong>💬 {getUserName(q.answeredBy)}</strong>
                    <small className="qa-date">Trả lời</small>
                  </div>
                  <p className="qa-answer-text">{q.answer}</p>
                </div>
              ) : (
                <>
                  {user?.role && ["admin", "recruiter"].includes(user.role) && (
                    answerFormId === q.id ? (
                      <form onSubmit={handleSubmitAnswer} className="answer-form">
                        <textarea
                          placeholder="Nhập câu trả lời..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          disabled={loading}
                          rows="3"
                        />
                        <div className="form-actions">
                          <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit"
                          >
                            {loading ? "Đang gửi..." : "Trả lời"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnswerFormId(null)}
                            className="btn-cancel"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className="btn-reply"
                        onClick={() => setAnswerFormId(q.id)}
                      >
                        Trả lời
                      </button>
                    )
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data">Chưa có câu hỏi nào.</p>
      )}

      {!showForm ? (
        <button className="btn-add" onClick={() => setShowForm(true)}>
          ➕ Đặt câu hỏi
        </button>
      ) : (
        <form onSubmit={handleSubmitQuestion} className="question-form">
          <textarea
            placeholder="Đặt câu hỏi của bạn..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            rows="3"
          />
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Đang gửi..." : "Gửi câu hỏi"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-cancel"
            >
              Hủy
            </button>
          </div>
        </form>
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
        <div className="info-box" style={{ position: "relative", display:"flex", gap:10}}>
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

export const renderHTML = (html) => {
  if (!html) return null;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function ProgrammOverview({ programm, role, openReviews, openQA }) {
  const { t, lang } = useI18n();
  const { user: currentUser } = useAuth();
  const [postTitles, setPostTitles] = useState([]);
  
  const navigate = useNavigate();
  const stripHTML = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    if (!programm || !Array.isArray(programm.posts)) {
      console.log("Programm chưa sẵn sàng", programm);
      return;
    }

  const fetchPostTitles = async () => {
    try {
      if (!Array.isArray(programm.posts) || programm.posts.length === 0) {
        return [];
      }
      const relatedPosts = await Promise.all(
        programm.posts.map((postId) => getPostById(postId))
      );
      // nếu API trả về { data }
      const posts = relatedPosts.map(res => res.data);
      setPostTitles(posts);
      // return posts;
    } catch (err) {
      console.error("❌ Fetch post titles error:", err);
    }
  };

    fetchPostTitles();
  }, [programm]);

  const handleClickPost = (s) => {
    navigate(`/news/${s}`);
  };

  return (
    <section className="programm-overview">
      <div className="overview-head">  
        <ProgrammHeader programm={programm} role={role} t={t} lang={lang} />

      </div>

      <ProgrammInfoBoxes
        programm={programm}
        currentUser={currentUser}
        t={t}
        lang={lang}
      />

      <div className="overview-grid">
        <div className="programm-journey">

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
        </div>


        <ProgrammJourney program={programm} lang={lang}/>

        <div className="programm-journey">
          <div className="overview-card">
            <h2>{t("programm.detail.overview.other")}</h2>
            <div className="top-programme-container">
              <Swiper
                modules={[Autoplay, Navigation]}
                slidesPerView={3}
                spaceBetween={-150}
                breakpoints={{
                  0: { slidesPerView: 1, spaceBetween: 16 },
                  640: { slidesPerView: 1, spaceBetween: 20 },
                  768: { slidesPerView: 2, spaceBetween: 24 },
                  1024: { slidesPerView: 3, spaceBetween: 30 },
                }}
                loop
                autoplay={{ delay: 10000, disableOnInteraction: false }}
                navigation={false}
              >
                {postTitles.map((p, idx) => {
                  return (
                    <SwiperSlide key={idx}>
                      <article
                        className="featured-card"
                        onClick={() => handleClickPost(p.slug)}
                        style={{ cursor: "pointer" }}
                      >
                        {p.title}
                        <div style={{width: "100%", height:1, marginTop:10, marginBottom: 20, background:"black"}}></div>
                        <TranslatedHtml 
                          html={p.content} 
                          lang={lang} 
                          isExpanded={true} 
                          maxLength={1000}
                          className={`story-text ${
                            p.content.expanded ? "expanded ql-editor" : "collapsed"
                          }`}  
                        />
                      </article>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </div>
        </div>

      </div>
    
      


    
    
    </section>
  );
}
 
function ProgrammJourney({ program, lang }) {

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