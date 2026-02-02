import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../i18n";
import {
  getProgramsList,
  deleteProgrammsById,
  requestASharedLink,
  addNewProgramm,
  updateProgram,
} from "../../../api";
import FilterSearch from "../../../components/filtersearch/FilterSearch";
import PostManagement from "../posts/PostManagement.jsx";
import SharedPrograms from "../shared/SharedPrograms.jsx";
import AddProgramForm from "../../../components/addprograms/Form.jsx";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import "./AllPrograms.css";
import Pagination from "../../../components/pagination/Pagination.jsx";

export default function AllPrograms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [message, setMessage] = useState("");

  // Form control
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [editProgram, setEditProgram] = useState(null);


const [sharingProgramId, setSharingProgramId] = useState(null);
const [copiedLink, setCopiedLink] = useState("");
const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const PAGE_SIZE = 9;

  const [currentPage, setCurrentPage] = useState(1);

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgramsList();
      const list = res.data || [];
      setPrograms(list);
      setFilteredPrograms([...list].reverse());
    } catch (err) {
      setError(err.message || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPrograms]);
  // ------------------ ACTIONS ------------------
  const handleDeleteProgram = async (programId) => {
    if (!window.confirm(t("admin.programms.messages.delete_confirm"))) return;
    try {
      await deleteProgrammsById(programId);
      await loadPrograms();
      setMessage(t("admin.programms.messages.delete_success"));
    } catch (err) {
      setMessage(err.message || t("admin.programms.messages.delete_failed"));
    }
    setTimeout(() => setMessage(""), 2500);
  };


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
  const handleShareClick = async (programm) => {
    try {
      setSharingProgramId(programm.id); // 👈 quan trọng
      setCopiedLink("");
      setIsGeneratingLink(true);

      const res = await requestASharedLink(programm.id, user._id);
      let link = res.data.link;

      if (!/^https?:\/\//i.test(link)) {
        link = `${window.location.origin}${link}`;
      }

      setCopiedLink(link);
      setIsGeneratingLink(false);

      await robustCopy(link);
    } catch (err) {
      console.error(err);
      setSharingProgramId(null);
      setIsGeneratingLink(false);
      alert("Không thể tạo liên kết chia sẻ!");
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
  
  const handleAddProgram = async (formData) => {
    try {
      await addNewProgramm(formData);
      await loadPrograms();
      setMessage(t("admin.programms.messages.added_success"));
    } catch (err) {
      setMessage(err.message || t("admin.programms.messages.added_failed"));
    } finally {
      setShowForm(false);
      setEditProgram(null);
      setFormMode("add");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleEditProgram = async (formData) => {
    if (!editProgram) return;
    try {
      await updateProgram(editProgram.id, formData);
      await loadPrograms();
      setMessage(t("admin.programms.messages.updated_success"));
    } catch (err) {
      setMessage(err.message || t("admin.programms.messages.updated_failed"));
    } finally {
      setShowForm(false);
      setEditProgram(null);
      setFormMode("add");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleFilterChange = (filters) => {
    const result = programs.filter((p) => {
      const matchType = !filters.type_category || p.type_category === filters.type_category;
      const matchLand = !filters.land || p.land === filters.land;
      const matchDeadline = !filters.deadline || (p.deadline && new Date(p.deadline) <= new Date(filters.deadline));
      const matchDegree = !filters.degrees || p.degrees === filters.degrees;
      const matchAge = !filters.age || (p.ages && p.ages.toString().includes(filters.age));
      return matchType && matchLand && matchDeadline && matchDegree && matchAge;
    });
    setFilteredPrograms(result);
  };

  const handleSelectProgram = (program) => {
    navigate(`/program/${program.slug}`, { state: { 
      programId: program.id,
      program } 
    });
  };

  const totalPages = Math.ceil(filteredPrograms.length / PAGE_SIZE);

  const displayedPrograms = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredPrograms.slice(start, end);
  }, [filteredPrograms, currentPage]);

    const isAdmin = user?.role === "admin";

    const tabs = isAdmin
      ? [
          { id: "all", label: t("recruiter.programms.tabs.all") },
          // { id: "saved", label: t("admin.programms.tabs.saved") },
          { id: "shared", label: t("admin.programms.tabs.shared") },
          { id: "posts", label: t("admin.programms.tabs.posts") },
        ]
      : [
          { id: "all", label: t("recruiter.programms.tabs.all") },
          // { id: "saved", label: t("recruiter.programms.tabs.saved") },
          { id: "shared", label: t("recruiter.programms.tabs.shared") },
        ];

  return (
    <div className="programs-page">
      <div className="programs-header">
        
        <div className="header-content">
          <h1 className="page-title">{t("admin.programms.title")}</h1>
          <div className="tab-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="toolbar">
          <FilterSearch
            programs={programs}
            onFilterChange={handleFilterChange}
            onSelectProgram={handleSelectProgram}
            onAddProgram={isAdmin ? () => {
              setShowForm(true);
              setFormMode("add");
            } : undefined}
          />
        </div>
      </div>

      {message && <p className="info-message">{message}</p>}

      {showForm && (
        <AddProgramForm
          title={formMode === "add" ? "Add" : "Edit"}
          defaultValues={formMode === "edit" ? editProgram : null}
          onSubmit={formMode === "add" ? handleAddProgram : handleEditProgram}
          onClose={() => {
            setShowForm(false);
            setEditProgram(null);
            setFormMode("add");
          }}
        />
      )}

      {!loading && !error && activeTab !== "posts" && activeTab !== "shared" && (
        <div className="programs-grid">
          {displayedPrograms.map((p) => (
            <article key={p.id} className="program-card">
              <div className="card-header">
                <img className="p-logo" src={p.progLogo} alt={p.name} loading="lazy" />
                <div className="title-wrap">
                  <h3 className="title">{p.name}</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="badges">
                  {p.company && <span className="badge">{p.company}</span>}
                  {p.country && <span className="badge">{p.country}</span>}
                  {p.duration && <span className="badge">{p.duration}</span>}
                </div>
                <div className="badges">
                  {p.bonus && <span className="badge">Bonus: {p.bonus}.</span>}
                  {p.type && <span className="badge">Type: {p.type}.</span>}
                  {p.industry && <span className="badge">Industry: {p.industry}.</span>}
                  {p.quota && <span className="badge">Vacancies: {p.quota}.</span>}
                  {p.fee && <span className="badge">Fee: {p.fee}.</span>}
                  {p.expectedIncome && <span className="badge">Expected Income: {p.expectedIncome}</span>}
                </div>
                {p.deadline && <p className="deadline">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>}
                
                {/* <p>Slug: {p.slug}</p> */}
                
              </div>
              <div className="card-actions" style={{ position: "relative" }}>
                
                <button className="view-btn" onClick={() => {
                  handleSelectProgram(p)
                }}>View</button>
                {isAdmin && (
                  <>
                    <button className="edit-btn" onClick={() => {
                      setFormMode("edit");
                      setEditProgram(p);
                      setShowForm(true);
                    }}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDeleteProgram(p.id)}>Delete</button>
                  </>
                )}
                {!isAdmin && (
              <>
               {/* <button className="share-btn" onClick={() => handleShareProgram(p.id)}>Share</button> */}
                
                  <button
                  style={{ textDecoration: "underline", cursor: "pointer", color: "#007bff" }}
                  onClick={() => handleShareClick(p)}
                >
                  {t("programm.detail.overview.share_action") || "Bấm để chia sẻ"}
                </button>
                  {sharingProgramId === p.id && (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="popup-link"
                    >
                      {isGeneratingLink ? (
                        <p className="popup-init">⏳ Đang tạo liên kết...</p>
                      ) : (
                        <>
                          <p className="popup-init">✅ Liên kết đã sẵn sàng</p>

                          <input
                            type="text"
                            value={copiedLink}
                            readOnly
                            onClick={handleInputCopy}
                            style={{ width: "175px" }}
                          />

                          <div style={{ display: "flex", justifyContent:"flex-end", gap: "10px", marginTop: "10px" }}>
                            <button onClick={() => handleManualCopy(copiedLink)}>
                              <FaCopy />
                            </button>

                            <a 
                                href={copiedLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()} 
                                className="icon-btn" 
                                title={t("recruiter.programms.open", "Mở")} 
                                style={{ }} 
                              > 
                                <FaExternalLinkAlt /> 
                              </a>

                              <button onClick={() => setSharingProgramId(null)}>
                                <FaTimes />
                              </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </>    
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && activeTab === "all" && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {activeTab === "shared" && <SharedPrograms />}
      {isAdmin && activeTab === "posts" && <PostManagement />}
    </div>
  );
}
