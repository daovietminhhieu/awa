import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  addNewProgramm,
  createPost,
  getProgrammsList,
  getSavedProgramms,
  saveProgrammById,
  unsaveProgrammById,
} from "../../api";
import ProgrammsList from "../../components/admin/management/programms/List";
import ListOfSharedProgramms from "../../components/admin/management/programms/Shared";
import FilterSearch from "../../components/FilterSearch";
import "./ProgrammsManagement.css";
import { useI18n } from "../../i18n";



// ------------------- AddProgramForm -------------------
export function AddProgramForm({ onSubmit, onClose, defaultValues }) {
  const { t } = useI18n();
  const [formData, setFormData] = useState(defaultValues);
  const [step, setStep] = useState(1);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="edit-modal">
      <div className="edit-form">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{t("admin.programms.edit.add_title") || "Add New Program"}</h2>

        <form onSubmit={handleSubmit}>
          {/* 🧩 Step 1: Basic Info */}
          {step === 1 && (
            <>
              <h3>{t("admin.programms.edit.basic_info") || "Basic Info"}</h3>

              {["title", "company", "type", "degrees", "duration", "land"].map((field) => (
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
              ))}

              <label>
                {t("admin.programms.edit.new.logoL") || "Logo URL:"}
                <input
                  name="logoL"
                  value={formData.logoL}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </label>

              <label>
                {t("admin.programms.edit.new.bonus") || "Bonus:"}
                <input
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleChange}
                  type="text"
                  placeholder={t('admin.programms.edit.new.enter_bonus')}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.vacancies") || "Vacancies:"}
                <input
                  name="vacancies"
                  value={formData.vacancies}
                  onChange={handleChange}
                  type="text"
                  placeholder={t('admin.programms.edit.new.enter_vacancies')}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.hired") || "Hired:"}
                <input
                  name="hired"
                  value={formData.hired}
                  onChange={handleChange}
                  type="text"
                  placeholder={t('admin.programms.edit.new_hired')}
                />
              </label>

              <button type="button" onClick={() => setStep(2)}>
                {t("admin.programms.edit.next") || "Next →"}
              </button>
            </>
          )}

          {/* 🧩 Step 2: Requirements */}
          {step === 2 && (
            <>
              <h3>{t("admin.programms.edit.requirements") || "Requirements"}</h3>
              {["age", "health", "education", "certificate"].map((f) => (
                <label key={f}>
                  {t(`admin.programms.edit.new.${f}`)}:
                  <input
                    name={`requirement.${f}`}
                    value={formData.requirement[f]}
                    onChange={handleChange}
                    placeholder={t(`admin.programms.edit.new.enter_${f}`)}
                  />
                </label>
              ))}

              <div className="form-buttons">
                <button type="button" onClick={() => setStep(1)}>
                  ← {t("admin.programms.edit.back") || "Back"}
                </button>
                <button type="button" onClick={() => setStep(3)}>
                  {t("admin.programms.edit.next") || "Next →"}
                </button>
              </div>
            </>
          )}

          {/* 🧩 Step 3: Details */}
          {step === 3 && (
            <>
              <h3>{t("admin.programms.edit.details") || "Details"}</h3>

              <label>
                {t("admin.programms.edit.new.details_overview") || "Overview:"}
                <textarea
                  name="details.overview"
                  value={formData.details.overview}
                  onChange={handleChange}
                  placeholder={t('admin.programms.edit.new.enter_details_overview')}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.details_other") || "Other:"}
                <textarea
                  name="details.other"
                  value={formData.details.other}
                  onChange={handleChange}
                  placeholder={t('admin.programms.edit.new.enter_details_other')}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.fee") || "Fee:"}
                <input name="fee" value={formData.fee} onChange={handleChange} placeholder={t('admin.programms.edit.new.enter_fee')}/>
              </label>

              <label>
                {t("admin.programms.edit.new.expected_salary") || "Expected Salary:"}
                <input
                  name="expected_salary"
                  value={formData.expected_salary}
                  onChange={handleChange}
                  placeholder={t('admin.programms.edit.new.enter_expected_salary')}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.deadline") || "Deadline:"}
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.public_day") || "Public Day:"}
                <input
                  type="date"
                  name="public_day"
                  value={formData.public_day}
                  onChange={handleChange}
                  placeholder={t('admin.programms.edit.new.enter_public_day')}
                />
              </label>

              <label>
                {t("admin.programms.edit.new.type_category") || "Type Category:"}
                <select
                  name="type_category"
                  value={formData.type_category}
                  onChange={handleChange}
                  required
                >
                  <option value="job">{t("admin.programms.edit.new.type_job") || "Job"}</option>
                  <option value="studium">{t("admin.programms.edit.new.type_studium") || "Studium"}</option>
                </select>
              </label>

              <label>
                {t("admin.programms.edit.new.is_active") || "Is Active:"}
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                >
                  <option value="true">{t("admin.programms.edit.new.active")}</option>
                  <option value="false">{t("admin.programms.edit.new.inactive")}</option>
                </select>
              </label>

              <div className="form-buttons">
                <button type="button" onClick={() => setStep(2)}>
                  ← {t("admin.programms.edit.back") || "Back"}
                </button>
                <button type="submit">
                  ✅ {t("admin.programms.edit.create") || "Create"}
                </button>
                <button type="button" onClick={onClose}>
                  {t("admin.programms.edit.cancel") || "Cancel"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}


// ------------------- ProgrammsManagement -------------------
export default function ProgrammsManagement() {
  const navigate = useNavigate();
  const { t } = useI18n();
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
      setError(t("admin.programms.messages.failed_load") || "Failed to load programms");
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
      alert(t("admin.programms.messages.added_success") || "✅ Added successfully");
      setShowAddForm(false);
      loadProgramms();
    } catch {
      alert(t("admin.programms.messages.added_failed") || "❌ Failed to add program");
    }
  };

  const handleFilterChange = (filters) => {
    let result = [...programms];

    result = result.filter((p) => {
      const matchType = !filters.type_category || p.type_category === filters.type_category;
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
  const displayedProgramms = useMemo(() => filteredProgramms, [filteredProgramms]);

  // --- Tabs fix: static IDs, translatable labels ---
  const tabs = [
    { id: "my", label: t("admin.programms.tabs.my") || "My Programms" },
    { id: "saved", label: t("admin.programms.tabs.saved") || "Saved Programms" },
    { id: "shared", label: t("admin.programms.tabs.shared") || "Shared Programms" },
  ];

  return (
    <div className="container">
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${activePage === tab.id ? "active" : ""}`}
            onClick={() => setActivePage(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {activePage === "my" && (
        <div style={{ width: "100%" }}>
          <div className="programm-toolbar">
            <FilterSearch
              programms={programms}
              onFilterChange={handleFilterChange}
              onSelectProgramm={handleSelectProgramm}
            />
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              {t("admin.programms.toolbar.add_new") || "+ Add New Programm"}
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && displayedProgramms.length === 0 && (
            <p>{t("admin.programms.messages.no_programms") || "No programms found"}</p>
          )}

          {!loading && displayedProgramms.length > 0 && (
            <>
              
              <ProgrammsList
                  programms={displayedProgramms}
                  savedPrograms={savedProgramsMap}
                  toggleSaveProgramm={toggleSaveProgramm}
                />           
                
              </>
           
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
                requirement: { age: "", health: "", education: "", certificate: "" },
                details: { overview: "", other: "" },
                is_active: "true",
                type_category: "job",
                public_day: "",
              }}
            />

          )}
        </div>
      )}

      {activePage === "saved" && (
        <ProgrammsList
          programms={savedProgramsList}
          savedPrograms={savedProgramsMap}
          toggleSaveProgramm={toggleSaveProgramm}
        />
      )}

      {activePage === "shared" && <ListOfSharedProgramms />}
    </div>
  );
}
