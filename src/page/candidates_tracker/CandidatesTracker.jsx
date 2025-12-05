import React, { useState, useEffect } from "react";
import { CandidateTable, ArchivedTable } from "../../components/table/Table";
// import Divider from '../../../../components/Divider';
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { getPotentialsList } from "../../api";
import "./CandidatesTracker.css";
import Footer from "../../components/footer/Footer";

export default function CandidatesTracker() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [submissions, setSubmissions] = useState([]);
  const [archived, setArchived] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [archivedPage, setArchivedPage] = useState(1);
  const archivedPerPage = 10;
  const [editedRows, setEditedRows] = useState({});
  const [loadingRow, setLoadingRow] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await getPotentialsList(isAdmin);
        const list = res?.data || [];
        const active = list.filter(c => c.referral?.status === "completed" && !c.archived);
        const done = list.filter(c => c.referral?.status === "rejected" || c.archived);
        setSubmissions(active);
        setArchived(done);
      } catch (err) {
        console.error("Failed to load potentials:", err);
      }
    };
    fetchCandidates();
  }, [isAdmin]);

  const filteredActive = submissions.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.candidate && c.candidate.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredActive.length / itemsPerPage);
  const currentSubmissions = filteredActive.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredArchived = archived.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.candidate && c.candidate.toLowerCase().includes(q)) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const archivedTotalPages = Math.ceil(filteredArchived.length / archivedPerPage);
  const currentArchived = filteredArchived.slice(
    (archivedPage - 1) * archivedPerPage,
    archivedPage * archivedPerPage
  );

  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };
  const handleArchivedPageChange = (page) => { if (page >= 1 && page <= archivedTotalPages) setArchivedPage(page); };

  const handleStatusChange = (id, newStatus) => setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], status: newStatus } }));
  const handleBonusChange = (id, newBonus) => setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], bonus: newBonus } }));

  const handleSave = (sub) => {
    setLoadingRow(sub.id);
    setTimeout(() => {
      alert(t('admin.candidates.updated_alert', { name: sub.candidate }) || `Updated ${sub.candidate}`);
      setEditedRows((prev) => { const n = { ...prev }; delete n[sub.id]; return n; });
      setLoadingRow(null);
    }, 500);
  };

  const handleRemove = (sub) => {
    if (!window.confirm(t('admin.candidates.remove_confirm', { name: sub.candidate }) || `Remove ${sub.candidate}?`)) return;
    setSubmissions((prev) => prev.filter((c) => c.id !== sub.id));
    alert(t('admin.candidates.removed_alert', { name: sub.candidate }) || `Removed ${sub.candidate}`);
  };

  return (
    <div className="ct-page">
      <div className="ct-container">
        <h2 className="ct-title">{t('admin.candidates.title') || 'Candidate Management'}</h2>
        <div className="ct-header">
          <div className="ct-tabs">
            <button className={`ct-tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
              Active ({submissions.length})
            </button>
            <button className={`ct-tab ${activeTab === 'archived' ? 'active' : ''}`} onClick={() => setActiveTab('archived')}>
              Archived ({archived.length})
            </button>
          </div>
          <div className="ct-search">
            <input
              type="text"
              placeholder={t('search') || 'Search by name, company, email'}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); setArchivedPage(1); }}
            />
          </div>
        </div>

        {activeTab === 'active' && (
        <div className="ct-card">
          <CandidateTable
            submissions={currentSubmissions}
            editedRows={editedRows}
            onStatusChange={handleStatusChange}
            onBonusChange={handleBonusChange}
            onSave={handleSave}
            onRemove={handleRemove}
            loadingRow={loadingRow}
          />

          <div className="ct-pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={currentPage === i + 1 ? "active" : ""} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>)}

        {activeTab === 'archived' && (
        <div className="ct-card">
          <h3 className="ct-subtitle">{t('admin.candidates.completed_title') || 'Completed (Hired / Rejected)'}</h3>
          <ArchivedTable archived={currentArchived} />
          <div className="ct-pagination">
            <button onClick={() => handleArchivedPageChange(archivedPage - 1)} disabled={archivedPage === 1}>Prev</button>
            {Array.from({ length: archivedTotalPages }, (_, i) => (
              <button key={i} className={archivedPage === i + 1 ? "active" : ""} onClick={() => handleArchivedPageChange(i + 1)}>{i + 1}</button>
            ))}
            <button onClick={() => handleArchivedPageChange(archivedPage + 1)} disabled={archivedPage === archivedTotalPages}>Next</button>
          </div>
        </div>)}
      </div>
    
    </div>
  );
}
