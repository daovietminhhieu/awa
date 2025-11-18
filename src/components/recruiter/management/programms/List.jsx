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

  const {t,lang} = useI18n();

  const [loadingIds, setLoadingIds] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
  // helper copy robust
  async function copyTextToClipboard(text) {
    // 1) Thử API hiện đại
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed:", err);
        // tiếp tục xuống fallback
      }
    }

    // 2) Fallback: textarea + document.execCommand('copy')
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      // tránh ảnh hưởng layout
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(ta);
      if (successful) return true;
      console.warn("execCommand('copy') returned false");
    } catch (err) {
      console.warn("execCommand fallback failed:", err);
    }

  // 3) Nếu tới đây vẫn chưa copy được → trả về false để UI hiển thị input để user copy thủ công
  return false;
}

  const [copiedId, setCopiedId] = useState(null);
  const [copiedLink, setCopiedLink] = useState("");

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Grid hiển thị */}
      <div
        className="programms-grid"
        
      >
        {currentItems.map((p) => {
          const isSaved = !!savedPrograms[p._id];
          const isLoading = !!loadingIds[p._id];
          const isExpired = new Date(p.deadline) < new Date();
          return (
            <Link
              key={p._id}
              to={`/recruiter/programmsdetail/${p._id}`}
              className="programm-card"
              style={{
                textDecoration: "none",
                pointerEvents: isLoading ? "none" : "auto",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                height: 300
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ width: 250 }}><TranslateText text={p.title} lang={lang}/></h3>
              </div>

              <ul className="programm-info">
                <li><b>{t('recruiter.programms.duration')}:</b> <TranslateText text={p.duration} lang={lang}/></li>
                <li><b>{t('recruiter.programms.status')}:</b> {getStatusByDeadline(p.deadline, t)}</li>
                <li><b>{t('recruiter.programms.deadline')}:</b> {formatDateTime(p.deadline)}</li>
              </ul>

              <div className="programm-extra">
                <p><b>{t('recruiter.programms.bonus')}</b> {p.bonus}</p>
                <p><b>{t('recruiter.programms.vacancies')}:</b> {p.vacancies}</p>
              </div>

              <div
                className="programm-footer"
                style={{ display: "flex", gap: "10px", marginTop: "10px" }}
              >
                <div style={{ position: "relative" }}>
                  <button
                    style={{
                      height: "40px",
                      cursor: isExpired ? "not-allowed" : "pointer",
                      opacity: isExpired ? 0.5 : 1,
                      display: copiedId === p._id? "none": "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: copiedId === p._id ? "#28a745" : "",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0 12px",
                      transition: "background 0.3s ease",
                    }}
                    disabled={isExpired}
                    onClick={async (e) => {
                      e.preventDefault();
                      if (isExpired) return;
                    
                      try {
                        // 1️⃣ Gọi API tạo link
                        const res = await requestASharedLink(p._id);
                        let link = res.data.link;
                    
                        // 2️⃣ Thêm domain nếu server trả path
                        if (!/^https?:\/\//i.test(link)) {
                          link = `${window.location.origin}${link}`;
                        }
                    
                        // 3️⃣ Hiện popup share luôn
                        setCopiedId(p._id);
                        setCopiedLink(link);
                    
                        // 4️⃣ Thử copy clipboard như bình thường
                        let copied = false;
                        try {
                          if (navigator.clipboard?.writeText) {
                            await navigator.clipboard.writeText(link);
                            copied = true;
                          }
                        } catch (err) {
                          console.warn("Clipboard API blocked:", err);
                        }
                    
                        // 5️⃣ Nếu Safari chặn → fallback execCommand
                        if (!copied) {
                          try {
                            const ta = document.createElement("textarea");
                            ta.value = link;
                            ta.style.position = "fixed";
                            ta.style.left = "-9999px";
                            ta.style.top = "0";
                            document.body.appendChild(ta);
                            ta.select();
                            const ok = document.execCommand("copy");
                            document.body.removeChild(ta);
                            if (ok) copied = true;
                          } catch (err) {
                            console.warn("Fallback execCommand failed:", err);
                          }
                        }
                    
                        // 6️⃣ Không báo lỗi khi safari chặn → Popup đã có nút mở link
                        // (Tránh làm phiền user iPad)
                        console.log("Copy result:", copied);
                    
                        // 7️⃣ Tự đóng popup sau 30s
                        setTimeout(() => setCopiedId(null), 30000);
                    
                      } catch (err) {
                        console.error("Create share link failed:", err);
                        alert(t('recruiter.programms.share_failed', 'Không thể tạo liên kết chia sẻ!'));
                      }
                    }}
                    
                    
                  >
                    <FaShareAlt />{" "}
                    
                      {t('recruiter.programms.share')}
                  </button>
                  
                  {copiedId === p._id && (
                    <div 
                      className="share-popup"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <p className="share-message">
                        ✅ {t('recruiter.programms.link_copied', 'Liên kết đã được sao chép!')}
                      </p>
                      <div className="second-line">
                        <div
                          className="close-popup-btn"
                          onClick={(e) => {
                            e.stopPropagation(); // ngăn click lan lên thẻ Link cha
                            e.preventDefault();
                            setCopiedId(null);
                          }}
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
                          🔗 {t('recruiter.programms.open_link', 'Mở liên kết')}
                        </a>
                      </div>
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
                    gap: "6px",
                    cursor: "pointer",
                    color: "white",
                    
                    border: "none",
                    fontSize: "1em",
                  }}
                >
                  {isSaved ? (
                    <>
                      <Archive size={18} />
                      <span>{t('recruiter.programms.unsave')}</span>
                    </>
                  ) : (
                    <>
                      <ArchiveRestore size={18} />
                      <span>{t('recruiter.programms.save')}</span>
                    </>
                  )}
                </button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >


          {(() => {
            const buttons = [];

            // 1️⃣ Luôn hiển thị trang đầu
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
                }}
              >
                1
              </button>
            );

            // 2️⃣ Dấu "..." nếu cần
            if (currentPage > 3) {
              buttons.push(<span key="dots-left">...</span>);
            }

            // 3️⃣ Các trang quanh currentPage
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
                  }}
                >
                  {i}
                </button>
              );
            }

            // 4️⃣ Dấu "..." và trang cuối
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
                    background: currentPage === totalPages ? "#007bff" : "#f0f0f0",
                    color: currentPage === totalPages ? "#fff" : "#333",
                    borderRadius: "5px",
                    padding: "5px 10px",
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

      {/* Hiển thị thông tin trang */}
      {isMobile && (
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          {t('recruiter.programms.pagination.page_info', { current: currentPage, total: totalPages }) || `Page ${currentPage} / ${totalPages}`}
    
        </p>
      )}
    </div>
  );
}
