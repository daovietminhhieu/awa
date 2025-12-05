import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n";
import {
  getProgrammsList,
  getSavedProgramms,
  saveProgrammById,
  unsaveProgrammById,
  deleteProgrammsById,
  requestASharedLink,
  addNewProgramm
} from "../../../api";
import FilterSearch from "../../../components/filtersearch/FilterSearch";
import PostManagement from "../posts/PostManagement.jsx";
import SharedPrograms from "../shared/SharedPrograms.jsx";
import AddProgramm from "../../../components/addprograms/Form.jsx";

import "./AllPrograms.css";

export default function AllPrograms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [programms, setProgramms] = useState([]);
  const [filteredProgramms, setFilteredProgramms] = useState([]);
  const [savedProgramsMap, setSavedProgramsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [message, setMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [shareState, setShareState] = useState({ show: false, programmId: null, link: "", loading: false });

  useEffect(() => {
    loadProgramms();
    loadSavedPrograms();
  }, []);

  const loadProgramms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgrammsList();
      const list = res.data || [];
      setProgramms(list);
      setFilteredProgramms(list);
    } catch (err) {
      setError(err.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const res = await getSavedProgramms();
      const map = {};
      (res.data || []).forEach((p) => (map[p._id] = true));
      setSavedProgramsMap(map);
    } catch (err) {
      console.error("Failed to load saved programs", err);
    }
  };

  const toggleSaveProgramm = async (programmId, isSaved) => {
    setSavedProgramsMap((prev) => {
      const copy = { ...prev };
      if (isSaved) delete copy[programmId];
      else copy[programmId] = true;
      return copy;
    });
    try {
      if (isSaved) await unsaveProgrammById(programmId);
      else await saveProgrammById(programmId);
      await loadSavedPrograms();
    } catch (error) {
      console.error("Failed to toggle save", error);
    }
  };

  const handleDeleteProgramm = async (programmId) => {
    const ok = window.confirm(t('admin.programms.messages.delete_confirm'));
    if (!ok) return;
    try {
      await deleteProgrammsById(programmId);
      setProgramms((prev) => prev.filter((p) => p._id !== programmId));
      setFilteredProgramms((prev) => prev.filter((p) => p._id !== programmId));
      setMessage(t('admin.program,s.messages.delete_success'));
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setMessage(err.message || t('admin.programms.messages.delete_failed'));
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleShareProgramm = async (programmId) => {
    try {
      setShareState({ show: true, programmId, link: "", loading: true });
      const res = await requestASharedLink(programmId);
      let link = res?.data?.link || res?.link || "";
      if (link && !/^https?:\/\//i.test(link)) link = `${window.location.origin}${link}`;
      setShareState({ show: true, programmId, link, loading: false });
      if (link) {
        try { await navigator.clipboard.writeText(link); setMessage(t('recruiter.programms.link_copied')); } catch { setMessage(t('recruiter.programms.link_ready')); }
      } else {
        setMessage(res?.message || t('admin.programms.messages.shared_request_sent'));
      }
    } catch (err) {
      setMessage(err.message || t('admin.programms.messages.shared_failed'));
      setShareState({ show: false, programmId: null, link: "", loading: false });
    }
    setTimeout(() => setMessage(""), 2500);
  };

  const handleAddProgram = async (formData) => {
    try {
      await addNewProgramm(formData);
      await loadProgramms();
      setMessage(t('admin.programms.messages.added_success'));
    } catch (err) {
      setMessage(err.message || t('admin.programms.messages.added_failed'));
    } finally {
      setShowAddForm(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleFilterChange = (filters) => {
    const result = programms.filter((p) => {
      const matchType = !filters.type_category || p.type_category === filters.type_category;
      const matchLand = !filters.land || p.land === filters.land;
      const matchDeadline = !filters.deadline || (p.deadline && new Date(p.deadline) <= new Date(filters.deadline));
      const matchDegree = !filters.degrees || p.degrees === filters.degrees;
      const matchAge = !filters.age || (p.ages && p.ages.toString().includes(filters.age));
      return matchType && matchLand && matchDeadline && matchDegree && matchAge;
    });
    setFilteredProgramms(result);
  };

  const handleSelectProgramm = (programm) =>
    navigate(`/programm/${programm.slug}`, { state: { programm } });

  const displayedProgramms = useMemo(() => {
    if (activeTab === "saved") return programms.filter((p) => savedProgramsMap[p._id]);
    return filteredProgramms;
  }, [activeTab, filteredProgramms, programms, savedProgramsMap]);

  const isAdmin = user?.role === "admin";
  const tabs = isAdmin
    ? [
        { id: "all", label: t("admin.programms.tabs.all") || "All" },
        { id: "saved", label: t("admin.programms.tabs.saved") || "Saved" },
        { id: "shared", label: t("admin.programms.tabs.shared") || "Shared" },
        { id: "posts", label: t("admin.programms.tabs.posts") || "Posts" },
      ]
    : [
        { id: "all", label: t("recruiter.programms.tabs.all") || "All" },
        { id: "saved", label: t("recruiter.programms.tabs.saved") || "Saved" },
        { id: "shared", label: t("recruiter.programms.tabs.shared") || "Shared" },
      ];

  return (
    <div className="programs-page">
      <div className="programs-header">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <FilterSearch
            programms={programms}
            onFilterChange={handleFilterChange}
            onSelectProgramm={handleSelectProgramm}
            onAddProgramm={isAdmin ? () => setShowAddForm(true) : undefined}
          />
      </div>
    </div>

      {message && <p className="info-message">{message}</p>}

      {showAddForm && (
        <AddProgramm
          onSubmit={handleAddProgram}
          onClose={() => setShowAddForm(false)}
          defaultValues={{
            title: "",
            company: "",
            type: "",
            degrees: "",
            duration: "",
            land: "",
            logoL: "",
            details: { overview: "", benefit: "" },
            requirement: { education: "" }
          }}
        />
      )}

      {loading && <p className="loading">Loading programs...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && activeTab !== "posts" && activeTab !== "shared" && (
        <div className="programs-grid">
          {displayedProgramms.map((p) => {
            const isSaved = !!savedProgramsMap[p._id];
            return (
              <article key={p._id} className="program-card">
                <div className="card-header">
                  <img className="p-logo" src={p.logoL} alt={p.title} loading="lazy" />
                  <div className="title-wrap">
                    <h3 className="title">{p.title}</h3>
                    <p className="company">{p.company}</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="badges">
                    {p.degrees && <span className="badge">{p.degrees}</span>}
                    {p.land && <span className="badge">{p.land}</span>}
                    {p.duration && <span className="badge">{p.duration}</span>}
                  </div>
                  {p.deadline && <p className="deadline">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>}
                </div>

                <div className="card-actions">
                  <button className="view-btn" onClick={() => handleSelectProgramm(p)}>View</button>
                  <button
                    className={`save-btn ${isSaved ? "saved" : ""}`}
                    onClick={() => toggleSaveProgramm(p._id, isSaved)}
                  >
                    {isSaved ? "Unsave" : "Save"}
                  </button>
                  {isAdmin && (
                    <>
                      <button className="edit-btn" onClick={() => navigate(`/admin/programmsdetail/${p.slug}`)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteProgramm(p._id)}>Delete</button>
                    </>
                  )}
                  {!isAdmin && (
                    <button className="share-btn" onClick={() => handleShareProgramm(p._id)}>Share</button>
                  )}
                  {shareState.show && shareState.programmId === p._id && (
                    <div style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 8, padding: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", width: "100%" }}>
                      {shareState.loading ? (
                        <p style={{ margin: 0 }}>⏳ {t('recruiter.programms.generating_link') || 'Generating link...'}</p>
                      ) : (
                        <>
                          <p style={{ margin: "0 0 8px 0" }}>✅ {t('recruiter.programms.link_ready') || 'Link ready'}</p>
                          <input
                            type="text"
                            value={shareState.link}
                            readOnly
                            onClick={(e) => { e.currentTarget.select(); document.execCommand("copy"); setMessage(t('recruiter.programms.link_copied') || 'Link copied'); }}
                            style={{ width: "100%", border: "1px solid #e0e0e0", borderRadius: 6, padding: 8, fontFamily: "monospace" }}
                          />
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <a href={shareState.link} target="_blank" rel="noopener noreferrer" className="view-btn" style={{ flex: 1, textAlign: "center" }}>{t('recruiter.programms.open') || 'Open'}</a>
                            <button className="edit-btn" style={{ flex: 1 }} onClick={() => setShareState({ show: false, programmId: null, link: "", loading: false })}>{t('recruiter.programms.close') || 'Close'}</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeTab === "shared" && (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <SharedPrograms />
        </div>
      )}

      {isAdmin && activeTab === "posts" && (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <PostManagement />
        </div>
      )}

    </div>
  );
}

