import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./List.css";
import {
  editProgrammsById,
  deleteProgrammsById,
} from "../../../../api";

// ==========================
// 🛠️ Modal Form for Editing
// ==========================
import { useI18n } from "../../../../i18n";

export function EditProgramForm({ programm, onClose, onSubmit }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ ...programm });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderInput = (label, name, type = "text") => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name] || ""}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <div className="admin-edit-modal">
      <div className="admin-edit-form">
  <h2>{t('admin.programms.edit.title') || 'Edit Program'}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="admin-form-grid"
        >
          {/* Thông tin cơ bản */}
          <h4>{t('admin.programms.edit.basic_info') || 'Basic Info'}</h4>
          {renderInput(t('admin.programms.edit.labels.title') || "Title", "title")}
          {renderInput(t('admin.programms.edit.labels.company') || "Company", "company")}
          {renderInput(t('admin.programms.edit.labels.logo') || "Logo URL", "logoUrl", "url")}
          {renderInput(t('admin.programms.edit.labels.type') || "Program Type", "type")}
          {renderInput(t('admin.programms.edit.labels.degrees') || "Degrees", "degrees")}
          {renderInput(t('admin.programms.edit.labels.duration') || "Duration", "duration")}
          {renderInput(t('admin.programms.edit.labels.land') || "Location", "land")}
          {renderInput(t('admin.programms.edit.labels.fee') || "Fee", "fee")}

          {/* Chi tiết tuyển dụng */}
          <h4>{t('admin.programms.edit.details_title') || 'Recruitment Details'}</h4>
          {renderInput(t('admin.programms.edit.labels.expected_salary') || "Expected Salary", "expected_salary")}
          {renderInput(t('admin.programms.edit.labels.deadline') || "Deadline", "deadline", "date")}
          {renderInput(t('admin.programms.edit.labels.vacancies') || "Vacancies", "vacancies", "number")}
          {renderInput(t('admin.programms.edit.labels.benefit') || "Benefit", "benefit")}
          {renderInput(t('admin.programms.edit.labels.review') || "Review", "review")}

          {/* Video & Link */}
          <h4>{t('admin.programms.edit.other_title') || 'Other'}</h4>
          {renderInput(t('admin.programms.edit.labels.video') || "Video URL", "videos", "url")}
          {renderInput(t('admin.programms.edit.labels.bonus') || "Bonus", "bonus")}
          {renderInput(t('admin.programms.edit.labels.public_day') || "Public Day", "public_day", "date")}

          <div className="admin-form-buttons">
            <button type="submit" className="admin-edit-btn">{t('admin.programms.edit.save') || 'Save'}</button>
            <button type="button" className="admin-delete-btn" onClick={onClose}>
              {t('admin.programms.edit.cancel') || 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================
// 🎓 Main List Component
// ==========================
export default function AdminProgrammsList({
  programms,
  savedPrograms,
  toggleSaveProgramm,
  onProgrammsUpdated,
}) {
  const { t } = useI18n();
  const [editingProgramm, setEditingProgramm] = useState(null);
  const [loadingIds, setLoadingIds] = useState({});
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

  // Toggle Save
  const handleSaveToggle = async (p) => {
    const isSaved = !!savedPrograms[p._id];
    setLoadingIds((prev) => ({ ...prev, [p._id]: true }));
    await toggleSaveProgramm(p._id, isSaved);
    setLoadingIds((prev) => {
      const copy = { ...prev };
      delete copy[p._id];
      return copy;
    });
  };

  
  

  return (
    <div>
      {/* GRID */}
      <div className="admin-programms-grid">
        {currentItems.map((p) => {
          const isSaved = !!savedPrograms[p._id];
          const isLoading = !!loadingIds[p._id];

          return (
            <div key={p._id} className="admin-program-card">
              <Link
                to={`/admin/programmsdetail/${p._id}`}
                className="admin-program-link"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="admin-program-header">
                  <h3>{p.title}</h3>
                  
                </div>

                <ul className="admin-program-info">
                  <li>
                    <b>{t('admin.programms.card.duration_label') || 'Duration:'}</b> {p.duration}
                  </li>
                  <li>
                    <b>{t('admin.programms.card.deadline_label') || 'Deadline:'}</b> {p.deadline}
                  </li>
                  <li>
                    <b>{t('admin.programms.card.status_label') || 'Status:'}</b>{" "}
                    {new Date(p.deadline) >= new Date()
                      ? t('admin.programms.card.status_open') || "Open"
                      : t('admin.programms.card.status_closed') || "Closed"}
                  </li>
                </ul>

                <div className="admin-program-extra">
                  <p className="bonus-tag">
                    <b>{t('admin.programms.card.bonus_label') || 'Bonus:'}</b> {p.bonus || ""}
                  </p>
                  <p className="vacancy-tag">
                    <b>{t('admin.programms.card.vacancy_label') || 'Applicants:'}</b> {p.vacancies || 0}
                  </p>
                </div>
              </Link>

              <div className="admin-program-footer">
                <button
                    className="admin-save-icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isLoading) handleSaveToggle(p);
                    }}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                     { isSaved ? ( <span>{t('admin.programms.card.unsave') || 'Unsave'}</span>) : ( <span>{t('admin.programms.card.save') || 'Save'}</span>)}
                     
                     
                </button>


                <button
                  className="admin-edit-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingProgramm(p);
                  }}
                >
                  {t('admin.programms.card.edit') || 'Edit'}
                </button>

                <button
                  className="admin-delete-btn"
                  onClick={async () => {
                    if (window.confirm(t('admin.programms.card.delete_confirm') || "Delete this program?"))
                      await deleteProgrammsById(p._id);
                  }}
                >
                  {t('admin.programms.card.delete') || 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PHÂN TRANG */}
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
            buttons.push(
              <button
                key={1}
                onClick={() => handlePageChange(1)}
                style={{
                  fontWeight: currentPage === 1 ? "bold" : "normal",
                  background: currentPage === 1 ? "#e67e22" : "#f0f0f0",
                  color: currentPage === 1 ? "#fff" : "#333",
                  borderRadius: "5px",
                  padding: "5px 10px",
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
                    background: i === currentPage ? "#e67e22" : "#f0f0f0",
                    color: i === currentPage ? "#fff" : "#333",
                    borderRadius: "5px",
                    padding: "5px 10px",
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
                    fontWeight:
                      currentPage === totalPages ? "bold" : "normal",
                    background:
                      currentPage === totalPages ? "#e67e22" : "#f0f0f0",
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

      {/* MOBILE PAGE INFO */}
      {isMobile && (
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          {t('admin.programms.pagination.page_info', { current: currentPage, total: totalPages }) || `Page ${currentPage} / ${totalPages}`}

        </p>
      )}

      {/* MODAL */}
      {editingProgramm && (
        <EditProgramForm
          programm={editingProgramm}
          onClose={() => setEditingProgramm(null)}
          onSubmit={async (data) => {
            await editProgrammsById(editingProgramm._id, data);
            alert(t('admin.programms.alert.updated_success') || 'Updated successfully!');
            setEditingProgramm(null);
            onProgrammsUpdated?.();
          }}
        />
      )}
    </div>
  );
}
