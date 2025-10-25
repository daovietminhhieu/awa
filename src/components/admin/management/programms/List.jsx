import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./List.css";
import {
  editProgrammsById,
  deleteProgrammsById,
  upFileToStorage,
} from "../../../../api";
import { useI18n } from "../../../../i18n";

// ==========================
// 🛠️ Modal Form for Editing
// ==========================
export function EditProgramForm({ programm, onClose, onSubmit }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ ...programm });
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState("");
  const fileInputRef = useRef(null);

  // --- Helper functions ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("details.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        details: { ...prev.details, [key]: value },
      }));
    } else if (name.startsWith("requirement.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        requirement: { ...prev.requirement, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 🟩 Upload file lên Supabase
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");
    if (!isVideo && !isImage) {
      alert("Vui lòng chọn file ảnh hoặc video hợp lệ!");
      return;
    }

    setUploading(true);
    try {
      const result = await upFileToStorage(selectedFile);
      if (!result) throw new Error("Upload failed: no URL returned");

      const fileType = isVideo ? "video" : "image";
      setFileType(fileType);
      setFormData((prev) => ({ ...prev, logoL: result }));
    } catch (err) {
      alert("Upload thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, logoL: "" }));
    setFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ renderInput mới — hỗ trợ cả input & textarea
  const renderInput = (
    label,
    name,
    type = "text",
    placeholderText = "",
    as = "input"
  ) => {
    const getValue = () => {
      if (name.startsWith("details.")) {
        const key = name.split(".")[1];
        return formData.details?.[key] || "";
      } else if (name.startsWith("requirement.")) {
        const key = name.split(".")[1];
        return formData.requirement?.[key] || "";
      } else {
        return formData[name] || "";
      }
    };

    return (
      <div className="form-group">
        <label htmlFor={name}>{label}</label>
        {as === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={getValue()}
            onChange={handleChange}
            rows={3}
            placeholder={placeholderText}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={getValue()}
            onChange={handleChange}
            placeholder={placeholderText}
          />
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="admin-edit-modal">
      <div className="admin-edit-form">
        <h2>{t("admin.programms.edit.title") || "Edit Program"}</h2>

        <form onSubmit={handleSubmit} className="admin-form-grid">
          {/* 🧩 BASIC INFO */}
          <h4>Basic Information</h4>
          {renderInput("Title", "title")}
          {renderInput("Company", "company")}
          {renderInput("Program Type", "type")}
          {renderInput("Type Category (job/studium)", "type_category")}
          {renderInput("Degrees", "degrees")}
          {renderInput("Duration", "duration")}
          {renderInput("Location", "land")}
          {renderInput("Fee", "fee")}
          {renderInput("Expected Salary", "expected_salary")}
          {renderInput("Deadline", "deadline", "date")}
          {renderInput("Vacancies", "vacancies", "number")}
          {renderInput("Hired", "hired", "number")}
          {renderInput("Benefit", "benefit")}
          {renderInput("Bonus", "bonus")}
          {renderInput("Public Day", "public_day", "date")}

          {/* 🖼️ Upload ảnh/video */}
          <div className="form-group">
            <label>Logo / Media</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {uploading && <p>⏳ Đang tải file lên...</p>}
            {formData.logoL && (
              <div style={{ marginTop: "8px" }}>
                {fileType === "video" || formData.logoL.includes(".mp4") ? (
                  <video
                    src={formData.logoL}
                    controls
                    style={{ width: "220px", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={formData.logoL}
                    alt="Preview"
                    style={{ width: "200px", borderRadius: "8px" }}
                  />
                )}
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-600 text-sm mt-2 underline"
                >
                  Xóa file
                </button>
              </div>
            )}
          </div>

          {/* 📄 DETAILS */}
          <h4>Details</h4>
          {renderInput("Overview", "details.overview", "text", "", "textarea")}
          {renderInput("Other Details", "details.other", "text", "", "textarea")}

          {/* 🧾 REQUIREMENTS */}
          <h4>Requirements</h4>
          {renderInput("Age", "requirement.age")}
          {renderInput("Health", "requirement.health")}
          {renderInput("Education", "requirement.education")}
          {renderInput("Certificate", "requirement.certificate")}

          {/* ✅ BUTTONS */}
          <div className="admin-form-buttons">
            <button type="submit" className="admin-edit-btn" disabled={uploading}>
              {uploading ? "⏳ Uploading..." : "Save"}
            </button>
            <button type="button" className="admin-delete-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================
// 🎓 MAIN ADMIN LIST
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
                    <b>Duration:</b> {p.duration}
                  </li>
                  <li>
                    <b>Deadline:</b> {p.deadline}
                  </li>
                  <li>
                    <b>Status:</b>{" "}
                    {new Date(p.deadline) >= new Date() ? "Open" : "Closed"}
                  </li>
                </ul>

                <div className="admin-program-extra">
                  <p className="bonus-tag">
                    <b>Bonus:</b> {p.bonus || ""}
                  </p>
                  <p className="vacancy-tag">
                    <b>Applicants:</b> {p.vacancies || 0}
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
                >
                  {isSaved ? "Unsave" : "Save"}
                </button>

                <button
                  className="admin-edit-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingProgramm(p);
                  }}
                >
                  Edit
                </button>

                <button
                  className="admin-delete-btn"
                  onClick={async () => {
                    if (window.confirm("Delete this program?")) {
                      await deleteProgrammsById(p._id);
                      alert("Deleted successfully!");
                      onProgrammsUpdated?.();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={i + 1 === currentPage ? "active-page" : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {isMobile && (
        <p style={{ textAlign: "center", marginTop: "10px", color: "#555" }}>
          Page {currentPage} / {totalPages}
        </p>
      )}

      {/* Edit Modal */}
      {editingProgramm && (
        <EditProgramForm
          programm={editingProgramm}
          onClose={() => setEditingProgramm(null)}
          onSubmit={async (data) => {
            try {
              await editProgrammsById(editingProgramm._id, data);
              alert("✅ Updated successfully!");
              setEditingProgramm(null);
              onProgrammsUpdated?.();
            } catch (err) {
              alert("❌ Lỗi khi cập nhật: " + err.message);
            }
          }}
        />
      )}
    </div>
  );
}
