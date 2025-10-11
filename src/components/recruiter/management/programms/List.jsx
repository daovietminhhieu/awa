import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaShareAlt } from "react-icons/fa";
import { Archive, ArchiveRestore } from "lucide-react";
import { requestASharedLink } from "../../../../api";

import { useI18n } from "../../../../i18n";

export function getStatusByDeadline(deadline, t) {
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

  const {t} = useI18n();

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
                <h3 style={{ width: 250 }}>{p.title}</h3>
              </div>

              <ul className="programm-info">
                <li><b>{t('recruiter.programms.duration')}:</b> {p.duration}</li>
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
                <button
                  style={{
                    height: "40px",
                    cursor: isExpired ? "not-allowed" : "pointer",
                    opacity: isExpired ? 0.5 : 1,
                  }}
                  disabled={isExpired}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (isExpired) return;
                    try {
                      const res = await requestASharedLink(p._id);
                      alert(`Shared link created:\n${res.data.link}`);
                    } catch (err) {
                      console.error("Error sharing link", err);
                      alert("Share failed");
                    }
                  }}
                >
                  <FaShareAlt /> {t('recruiter.programms.share')}
                </button>

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
