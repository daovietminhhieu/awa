import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import { Archive, ArchiveRestore } from "lucide-react";
import { requestASharedLink } from "../../../../api";

import { useI18n } from "../../../../i18n";
import TranslateText from "../../../../TranslateableText";

function getStatusByDeadline(deadline, t) {
  const currentDate = new Date();
  const deadlineDate = new Date(deadline);
  return deadlineDate < currentDate
    ? t("admin.programms.status_closed", "Đã đóng")
    : t("admin.programms.status_open", "Đang tuyển");
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function ProgrammsList({ programms, savedPrograms, toggleSaveProgramm }) {
  const { t, lang } = useI18n();

  const [loadingIds, setLoadingIds] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [copiedId, setCopiedId] = useState(null);
  const [copiedLink, setCopiedLink] = useState("");

  const itemsPerPage = 6;
  const totalPages = Math.ceil(programms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = programms.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveUnsave = async (p) => {
    const isSaved = !!savedPrograms[p._id];
    setLoadingIds((prev) => ({ ...prev, [p._id]: true }));
    setError(null);

    try {
      await toggleSaveProgramm(p._id, isSaved);
    } catch (err) {
      console.error("Failed to toggle save", err);
      setError(`Failed to ${isSaved ? "unsave" : "save"} programm "${p.title}"`);
    }

    setLoadingIds((prev) => {
      const copy = { ...prev };
      delete copy[p._id];
      return copy;
    });
  };

  async function robustCopy(text) {
    // Try modern API
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {}
    }

    // Fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {}

    return false;
  }

  const handleShare = async (p) => {
    try {
      const res = await requestASharedLink(p._id);
      let link = res.data.link;

      if (!/^https?:\/\//i.test(link)) {
        link = `${window.location.origin}${link}`;
      }

      // Copy first (requires direct user gesture)
      await robustCopy(link);

      setCopiedId(p._id);
      setCopiedLink(link);

      setTimeout(() => setCopiedId(null), 30000);
    } catch (err) {
      console.error(err);
      alert(t("recruiter.programms.share_failed", "Không thể tạo liên kết chia sẻ!"));
    }
  };
  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="programms-grid">
        {currentItems.map((p) => {
          const isSaved = !!savedPrograms[p._id];
          const isLoading = !!loadingIds[p._id];
          const isExpired = new Date(p.deadline) < new Date();

          return (
            <div
              key={p._id}
              className="programm-card"
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                height: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}
            >
              {/* 🟦 CARD LINK (KHÔNG BAO GỒM SHARE & SAVE) */}
              <Link
                to={`/recruiter/programmsdetail/${p._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h3 style={{ width: 250 }}>
                    <TranslateText text={p.title} lang={lang} />
                  </h3>
                </div>

                <ul className="programm-info">
                  <li>
                    <b>{t("recruiter.programms.duration")}:</b>{" "}
                    <TranslateText text={p.duration} lang={lang} />
                  </li>
                  <li>
                    <b>{t("recruiter.programms.status")}:</b>{" "}
                    {getStatusByDeadline(p.deadline, t)}
                  </li>
                  <li>
                    <b>{t("recruiter.programms.deadline")}:</b>{" "}
                    {formatDateTime(p.deadline)}
                  </li>
                </ul>

                <div className="programm-extra">
                  <p>
                    <b>{t("recruiter.programms.bonus")}</b> {p.bonus}
                  </p>
                  <p>
                    <b>{t("recruiter.programms.vacancies")}:</b> {p.vacancies}
                  </p>
                </div>
              </Link>

              {/* 🟦 FOOTER BUTTONS: SHARE + SAVE */}
              <div
                className="programm-footer"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px"
                }}
              >
                {/* SHARE BUTTON */}
                <div style={{ position: "relative" }}>
                  <button
                    style={{
                      height: "40px",
                      cursor: isExpired ? "not-allowed" : "pointer",
                      opacity: isExpired ? 0.5 : 1,
                      display: copiedId === p._id ? "none" : "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0 12px",
                      transition: "background 0.3s ease"
                    }}
                    disabled={isExpired}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isExpired) return;
                      handleShare(p);
                    }}
                  >
                    <FaShareAlt />
                    {t("recruiter.programms.share")}
                  </button>

                  {/* POPUP SHARE */}
                  {copiedId === p._id && (
                    <div
                      className="share-popup"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        position: "absolute",
                        top: "45px",
                        left: "0",
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "10px",
                        zIndex: 30,
                        width: "250px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      <p className="share-message">
                        ✅{" "}
                        {t(
                          "recruiter.programms.link_copied",
                          "Liên kết đã được sao chép!"
                        )}
                      </p>

                      <div
                        className="second-line"
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <div
                          className="close-popup-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCopiedId(null);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          ❌
                        </div>

                        <a
                          href={copiedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="share-link"
                        >
                          🔗{" "}
                          {t("recruiter.programms.open_link", "Mở liên kết")}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* SAVE BUTTON */}
                <button
                  className="save-icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isLoading) handleSaveUnsave(p);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    color: "white",
                    background: "#6c757d",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0 12px",
                    height: "40px"
                  }}
                >
                  {isSaved ? (
                    <>
                      <Archive size={18} />
                      <span>{t("recruiter.programms.unsave")}</span>
                    </>
                  ) : (
                    <>
                      <ArchiveRestore size={18} />
                      <span>{t("recruiter.programms.save")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          {(() => {
            const buttons = [];
            buttons.push(
              <button
                key={1}
                onClick={() => handlePageChange(1)}
                style={{
                  fontWeight: currentPage === 1 ? "bold" : "normal",
                  background: currentPage === 1 ? "#007bff" : "#f0f0f0",
                  color: currentPage === 1 ? "#fff" : "#333",
                  borderRadius: "5px",
                  padding: "5px 10px"
                }}
              >
                1
              </button>
            );

            if (currentPage > 3) {
              buttons.push(<span key="dots-left">...</span>);
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
              buttons.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  style={{
                    fontWeight: i === currentPage ? "bold" : "normal",
                    background: i === currentPage ? "#007bff" : "#f0f0f0",
                    color: i === currentPage ? "#fff" : "#333",
                    borderRadius: "5px",
                    padding: "5px 10px"
                  }}
                >
                  {i}
                </button>
              );
            }

            if (currentPage < totalPages - 2) {
              buttons.push(<span key="dots-right">...</span>);
            }

            if (totalPages > 1) {
              buttons.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  style={{
                    fontWeight: currentPage === totalPages ? "bold" : "normal",
                    background:
                      currentPage === totalPages ? "#007bff" : "#f0f0f0",
                    color: currentPage === totalPages ? "#fff" : "#333",
                    borderRadius: "5px",
                    padding: "5px 10px"
                  }}
                >
                  {totalPages}
                </button>
              );
            }

            return buttons;
          })()}
        </div>
      )}

      {isMobile && (
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          {t("recruiter.programms.pagination.page_info", {
            current: currentPage,
            total: totalPages
          })}
        </p>
      )}
    </div>
  );
}
