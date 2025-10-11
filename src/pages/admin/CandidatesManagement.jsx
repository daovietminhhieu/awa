import React, { useState, useEffect } from "react";
import { CandidateTable, ArchivedTable} from "../../components/admin/management/candidates/Table";
import { mockCandidates } from "../../mocks/candidates";
import { useI18n } from "../../i18n";

import { getPotentialsList } from "../../api";

import './CandidatesManagement.css';

export default function CandidateManagement() {
  const { t } = useI18n();
  const [submissions, setSubmissions] = useState(mockCandidates.filter((c) => !c.finalized));
  const [archived, setArchived] = useState(mockCandidates.filter((c) => c.finalized));
  const [editedRows, setEditedRows] = useState({});
  const [loadingRow, setLoadingRow] = useState(null);


  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await getPotentialsList(true);
        const list = res?.data || [];

        console.log("📋 Candidate list:", list);

        // Giả sử mỗi candidate có trường "status" hoặc "archived"
        const active = list.filter(c => c.programm?.completed !== "true" && !c.archived);
        const done = list.filter(c => c.programm?.completed === "true" || c.archived);
        console.log(active);
        console.log(done)
        setSubmissions(active);
        setArchived(done);
      } catch (err) {
        console.error("❌ Failed to load potentials:", err);
      }
    };

    fetchCandidates();
  }, []);



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
    <div className="admin-table-wrapper">
      <h2>{t('admin.candidates.title') || 'Candidate Management (Mock Data)'}</h2>
      <CandidateTable
        submissions={submissions}
        editedRows={editedRows}
        onStatusChange={handleStatusChange}
        onBonusChange={handleBonusChange}
        onSave={handleSave}
        onRemove={handleRemove}
        loadingRow={loadingRow}
      />
      <h3 style={{ marginTop: 24 }}>{t('admin.candidates.completed_title') || 'Completed (Hired / Rejected)'}</h3>
      <ArchivedTable archived={archived} />
    </div>
  );
}
