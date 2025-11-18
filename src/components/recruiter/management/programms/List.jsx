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
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

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
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {}
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
    } catch {}

    return false;
  }

  const handleShare = async (p) => {
    try {
      setCopiedId(p._id);
      setCopiedLink("");
      setIsGeneratingLink(true);

      const res = await requestASharedLink(p._id);
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

      setTimeout(() => {
        setCopiedId(null);
        setCopiedLink("");
      }, 30000);
    } catch (err) {
      console.error(err);
      setCopiedId(null);
      setCopiedLink("");
      setIsGeneratingLink(false);
      alert(t("recruiter.programms.share_failed", "Không thể tạo liên kết chia sẻ!"));
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

              <div
                className="programm-footer"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px"
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <button
                    style={{
                      height: "40px",
                      cursor: isExpired ? "not-allowed" : "pointer",
                      opacity: isExpired ? 0.5 : 1,
                      display: copiedId === p._id ? "none" : "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      background: "#f97316",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0 12px",
                      transition: "background 0.3s ease",
                      width: "100%"
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

                  {copiedId === p._id && (
                    <div
                      className="share-popup"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        position: isMobile ? "fixed" : "absolute",
                        ...(isMobile
                          ? {
                              bottom: "20px",
                              left: "250px",
                              right: "20px",
                              maxWidth: "calc(100% - 40px)",
                              height:250
                            }
                          : {
                              top: "45px",
                              left: "0",
                              minWidth: "280px"
                            }
                        ),
                        background: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "12px",
                        zIndex: 50,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      {isGeneratingLink ? (
                        <p className="share-message" style={{ margin: "0", fontSize: isMobile ? "15px" : "14px", textAlign: "center" }}>
                          ⏳ {t("recruiter.programms.generating_link", "Đang tạo liên kết...")}
                        </p>
                      ) : (
                        <>
                          <p className="share-message" style={{ margin: "0 0 10px 0", fontSize: isMobile ? "15px" : "14px" }}>
                            ✅ {t("recruiter.programms.link_ready", "Liên kết đã sẵn sàng")}
                          </p>

                          <div
                            style={{
                              background: "#f9f9f9",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              padding: "10px",
                              marginBottom: "10px",
                              wordBreak: "break-all",
                              maxHeight: isMobile ? "80px" : "auto",
                              overflowY: "auto"
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
                                fontSize: isMobile ? "13px" : "12px",
                                cursor: "pointer",
                                padding: "0",
                                fontFamily: "monospace",
                                lineHeight: "1.4"
                              }}
                            />
                          </div>

                          <p style={{ fontSize: isMobile ? "13px" : "12px", color: "#666", margin: "0 0 10px 0" }}>
                            {t("recruiter.programms.tap_to_copy", "Nhấn để sao chép")}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "8px",
                              flexWrap: isMobile ? "wrap" : "nowrap"
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleManualCopy(copiedLink);
                              }}
                              style={{
                                flex: isMobile ? "1 1 calc(50% - 4px)" : 1,
                                padding: "10px 12px",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: isMobile ? "13px" : "12px",
                                fontWeight: "500"
                              }}
                            >
                              📋 {t("recruiter.programms.copy", "Sao chép")}
                            </button>

                            <a
                              href={copiedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                flex: isMobile ? "1 1 calc(50% - 4px)" : 1,
                                padding: "10px 12px",
                                background: "#17a2b8",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontSize: isMobile ? "13px" : "12px",
                                fontWeight: "500",
                                textAlign: "center"
                              }}
                            >
                              🔗 {t("recruiter.programms.open", "Mở")}
                            </a>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCopiedId(null);
                                setCopiedLink("");
                              }}
                              style={{
                                flex: isMobile ? "1 1 100%" : "0 0 auto",
                                padding: "10px 12px",
                                background: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: isMobile ? "13px" : "12px",
                                fontWeight: "500",
                                marginTop: isMobile ? "4px" : "0"
                              }}
                            >
                              ❌ {t("recruiter.programms.close", "Đóng")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

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
                    justifyContent: "center",
                    gap: "6px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.6 : 1,
                    color: "white",
                    background: "#f97316",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0 12px",
                    height: "40px",
                    minWidth: "100px"
                  }}
                  disabled={isLoading}
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
                  padding: "5px 10px",
                  border: "none",
                  cursor: "pointer"
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
                    padding: "5px 10px",
                    border: "none",
                    cursor: "pointer"
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
                    padding: "5px 10px",
                    border: "none",
                    cursor: "pointer"
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
