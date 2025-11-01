import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  addNewProgramm,
  getProgrammsList,
  getSavedProgramms,
  saveProgrammById,
  unsaveProgrammById,
  upFileToStorage,
} from "../../api";
import ProgrammsList from "../../components/admin/management/programms/List";
import ListOfSharedProgramms from "../../components/admin/management/programms/Shared";
import FilterSearch from "../../components/FilterSearch";
import "./ProgrammsManagement.css";
import { useI18n } from "../../i18n";
import Payments from "../../components/admin/management/programms/Payment";
import TranslatableText from "../../TranslateableText";

/* =========================================================
   🟢 ADD PROGRAM FORM
   ========================================================= */
export function AddProgramForm({ onSubmit, onClose, defaultValues }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(defaultValues);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState(""); // image | video
  const fileInputRef = useRef(null);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Upload file lên Supabase
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

      setFileType(isVideo ? "video" : "image");
      setFormData((prev) => ({ ...prev, logoL: result }));

      console.log("📦 File uploaded to Supabase:", result);
    } catch (err) {
      alert("Upload thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.logoL) {
      alert("Vui lòng tải lên logo hoặc video trước khi tạo chương trình!");
      return;
    }
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="edit-modal">
      <div className="edit-form">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>{t("admin.programms.edit.add_title") || "Add New Program"}</h2>

        <form onSubmit={handleSubmit}>
          <h3>{t("admin.programms.edit.basic_info") || "Basic Info"}</h3>

          {["title", "company", "type", "degrees", "duration", "land"].map(
            (field) => (
              <label key={field}>
                {t(`admin.programms.edit.new.${field}`)}:
                <input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required={field === "title"}
                  placeholder={t(`admin.programms.edit.new.enter_${field}`)}
                />
              </label>
            )
          )}

          {/* Upload ảnh/video */}
          <label>
            {t("admin.programms.edit.new.logoL") || "Logo / Media:"}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {uploading && (
              <p className="text-sm text-blue-600 mt-1">
                ⏳ {t("common.uploading") || "Đang tải file lên..."}
              </p>
            )}
            {formData.logoL && (
              <div style={{ marginTop: "8px" }}>
                {fileType === "image" ? (
                  <img
                    src={formData.logoL}
                    alt="Preview"
                    style={{
                      width: "200px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <video
                    src={formData.logoL}
                    controls
                    style={{
                      width: "220px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
              </div>
            )}
          </label>

          {/* Thông tin thêm */}
          <label>
            Overview:
            <textarea
              name="details.overview"
              value={formData.details.overview}
              onChange={handleChange}
              placeholder="Short program overview"
            />
          </label>

          <label>
            Requirements:
            <textarea
              name="requirement.education"
              value={formData.requirement.education}
              onChange={handleChange}
              placeholder="Required education level"
            />
          </label>

          {/* Buttons */}
          <div className="form-buttons">
            <button type="submit" disabled={uploading}>
              {uploading
                ? "Đang tải file..."
                : `✅ ${t("admin.programms.edit.create") || "Create"}`}
            </button>
            <button type="button" onClick={onClose}>
              {t("admin.programms.edit.cancel") || "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   🟦 MAIN MANAGEMENT PAGE
   ========================================================= */
export default function ProgrammsManagement() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [programms, setProgramms] = useState([]);
  const [filteredProgramms, setFilteredProgramms] = useState([]);
  const [savedProgramsMap, setSavedProgramsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState("my");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadProgramms();
    loadSavedPrograms();
  }, []);

  const loadProgramms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgrammsList();
      setProgramms(res.data || []);
      setFilteredProgramms(res.data || []);
    } catch {
      setError(
        t("admin.programms.messages.failed_load") || "Failed to load programms"
      );
    }
    setLoading(false);
  };

  const loadSavedPrograms = async () => {
    try {
      const res = await getSavedProgramms();
      const map = {};
      (res.data || []).forEach((p) => (map[p._id] = true));
      setSavedProgramsMap(map);
    } catch {
      setError(
        t("admin.programms.messages.failed_load_saved") ||
          "Failed to load saved programms"
      );
    }
  };

  const handleAddNewProgramm = async (newData) => {
    try {
      await addNewProgramm(newData);
      alert(
        t("admin.programms.messages.added_success") || "✅ Added successfully"
      );
      setShowAddForm(false);
      loadProgramms();
    } catch {
      alert(
        t("admin.programms.messages.added_failed") || "❌ Failed to add program"
      );
    }
  };

  const handleFilterChange = (filters) => {
    let result = [...programms];

    result = result.filter((p) => {
      const matchType =
        !filters.type_category || p.type_category === filters.type_category;
      const matchLand = !filters.land || p.land === filters.land;
      const matchDeadline =
        !filters.deadline || new Date(p.deadline) <= new Date(filters.deadline);
      const matchDegree = !filters.degrees || p.degrees === filters.degrees;
      const matchAge =
        !filters.age || (p.ages && p.ages.toString().includes(filters.age));
      return matchType && matchLand && matchDeadline && matchDegree && matchAge;
    });

    setFilteredProgramms(result);
  };

  const handleSelectProgramm = (programm) =>
    navigate(`/programm/${programm._id}`, { state: { programm } });

  const toggleSaveProgramm = async (programmId, isSaved) => {
    setSavedProgramsMap((prev) => {
      const copy = { ...prev };
      if (isSaved) delete copy[programmId];
      else copy[programmId] = true;
      return copy;
    });

    try {
      isSaved
        ? await unsaveProgrammById(programmId)
        : await saveProgrammById(programmId);
      await loadSavedPrograms();
    } catch (e) {
      console.error(e);
    }
  };

  const savedProgramsList = programms.filter((p) => savedProgramsMap[p._id]);
  const displayedProgramms = useMemo(
    () => filteredProgramms,
    [filteredProgramms]
  );

  const tabs = [
    { id: "my", label: t("admin.programms.tabs.my") || "My Programms" },
    {
      id: "saved",
      label: t("admin.programms.tabs.saved") || "Saved Programms",
    },
    {
      id: "shared",
      label: t("admin.programms.tabs.shared") || "Shared Programms",
    },
    { id: "payments", label: t("admin.programms.tabs.payment") || "Payment" },
  ];

  return (
    <div className="container">
      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${activePage === tab.id ? "active" : ""}`}
            onClick={() => setActivePage(tab.id)}
          >
            <TranslatableText text={tab.label} lang={lang} />
          </div>
        ))}
      </div>

      {/* My Programms */}
      {activePage === "my" && (
        <div className="programs-section">
          <div className="programm-toolbar">
            <FilterSearch
              programms={programms}
              onFilterChange={handleFilterChange}
              onSelectProgramm={handleSelectProgramm}
            />
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              <TranslatableText
                text={
                  t("admin.programms.toolbar.add_new") || "+ Add New Program"
                }
                lang={lang}
              />
            </button>
          </div>

          {loading && (
            <p>
              <TranslatableText text="Loading..." lang={lang} />
            </p>
          )}
          {error && (
            <p className="error-text">
              <TranslatableText text={error} lang={lang} />
            </p>
          )}
          {!loading && displayedProgramms.length === 0 && (
            <p>
              <TranslatableText
                text={
                  t("admin.programms.messages.no_programms") ||
                  "No programms found"
                }
                lang={lang}
              />
            </p>
          )}

          {!loading && displayedProgramms.length > 0 && (
            <ProgrammsList
              programms={displayedProgramms}
              savedPrograms={savedProgramsMap}
              toggleSaveProgramm={toggleSaveProgramm}
              lang={lang} // <-- truyền lang xuống ProgrammsList để dịch content động
            />
          )}

          {showAddForm && (
            <AddProgramForm
              onSubmit={handleAddNewProgramm}
              onClose={() => setShowAddForm(false)}
              defaultValues={{
                title: "",
                company: "",
                logoL: "",
                type: "",
                degrees: "",
                duration: "",
                land: "",
                fee: "",
                expected_salary: "",
                deadline: "",
                bonus: "",
                vacancies: "",
                hired: "",
                requirement: {
                  age: "",
                  health: "",
                  education: "",
                  certificate: "",
                },
                details: { overview: "", other: "" },
                is_active: "true",
                type_category: "job",
                public_day: "",
              }}
            />
          )}
        </div>
      )}

      {/* Saved Programms */}
      {activePage === "saved" && (
        <ProgrammsList
          programms={savedProgramsList}
          savedPrograms={savedProgramsMap}
          toggleSaveProgramm={toggleSaveProgramm}
          lang={lang}
        />
      )}

      {/* Shared Programms */}
      {activePage === "shared" && <ListOfSharedProgramms lang={lang} />}

      {/* Payments */}
      {activePage === "payments" && <Payments lang={lang} />}
    </div>
  );
}
