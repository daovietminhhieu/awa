import React, { useState, useEffect } from "react";
import { CandidateTable, ArchivedTable } from "../../components/admin/management/candidates/Table";
import Divider from '../../components/Divider';
import { useI18n } from "../../i18n";
import { getPotentialsList } from "../../api";
import './CandidatesManagement.css';
import Footer from "../../components/Footer";

export default function CandidateManagement() {
  const { t } = useI18n();

  // Dữ liệu
  const [submissions, setSubmissions] = useState([]);
  const [archived, setArchived] = useState([]);

  // Phân trang cho bảng submissions
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Phân trang cho bảng archived
  const [archivedPage, setArchivedPage] = useState(1);
  const archivedPerPage = 10;

  // Trạng thái chỉnh sửa và loading
  const [editedRows, setEditedRows] = useState({});
  const [loadingRow, setLoadingRow] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await getPotentialsList(true);
        const list = res?.data || [];

        console.log(list);
        const active = list.filter(c => c.referral?.status === "completed" && !c.archived);
        const done = list.filter(c => c.referral?.status === "rejected" || c.archived);

        setSubmissions(active);
        setArchived(done); 
      } catch (err) {
        console.error("❌ Failed to load potentials:", err);
      }
    };

    fetchCandidates();
  }, []);

  // Phân trang submissions
  const totalPages = Math.ceil(submissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubmissions = submissions.slice(indexOfFirstItem, indexOfLastItem);

  // Phân trang archived
  const archivedTotalPages = Math.ceil(archived.length / archivedPerPage);
  const archivedStart = (archivedPage - 1) * archivedPerPage;
  const currentArchived = archived.slice(archivedStart, archivedStart + archivedPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleArchivedPageChange = (page) => {
    if (page >= 1 && page <= archivedTotalPages) {
      setArchivedPage(page);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], status: newStatus } }));
  };

  const handleBonusChange = (id, newBonus) => {
    setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], bonus: newBonus } }));
  };

  const handleSave = (sub) => {
    setLoadingRow(sub.id);
    setTimeout(() => {
      alert(t('admin.candidates.updated_alert', { name: sub.candidate }) || `Updated ${sub.candidate}`);
      setEditedRows((prev) => {
        const n = { ...prev };
        delete n[sub.id];
        return n;
      });
      setLoadingRow(null);
    }, 500);
  };

  const handleRemove = (sub) => {
    if (!window.confirm(t('admin.candidates.remove_confirm', { name: sub.candidate }) || `Remove ${sub.candidate}?`)) return;
    setSubmissions((prev) => prev.filter((c) => c.id !== sub.id));
    alert(t('admin.candidates.removed_alert', { name: sub.candidate }) || `Removed ${sub.candidate}`);
  };

  return (
    <div>
      <div className="admin-table-wrapper">
      <h2 style={{ textAlign: "center", marginTop: "50px", marginBottom: "20px" }}>
        {t('admin.candidates.title') || 'Candidate Management'}
      </h2>

      {/* Bảng chính */}
      <CandidateTable
        submissions={currentSubmissions}
        editedRows={editedRows}
        onStatusChange={handleStatusChange}
        onBonusChange={handleBonusChange}
        onSave={handleSave}
        onRemove={handleRemove}
        loadingRow={loadingRow}
      />

      {/* Phân trang submissions */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          « Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next »
        </button>
      </div>

      <Divider />

      <h3 style={{ textAlign: "center", marginTop: "30px" }}>
        {t('admin.candidates.completed_title') || 'Completed (Hired / Rejected)'}
      </h3>

      <ArchivedTable archived={currentArchived} />

      {/* Phân trang archived */}
      <div className="pagination">
        <button onClick={() => handleArchivedPageChange(archivedPage - 1)} disabled={archivedPage === 1}>
          « Prev
        </button>
        {Array.from({ length: archivedTotalPages }, (_, i) => (
          <button
            key={i}
            className={archivedPage === i + 1 ? "active" : ""}
            onClick={() => handleArchivedPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => handleArchivedPageChange(archivedPage + 1)} disabled={archivedPage === archivedTotalPages}>
          Next »
        </button>
      </div>
    </div>
    </div>
  );
}
