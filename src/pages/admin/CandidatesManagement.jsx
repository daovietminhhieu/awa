import React, { useState } from "react";
import { CandidateTable, ArchivedTable} from "../../components/admin/management/candidates/Table";
import { mockCandidates } from "../../mocks/candidates";

import './CandidatesManagement.css';

export default function CandidateManagement() {
  const [submissions, setSubmissions] = useState(mockCandidates.filter((c) => !c.finalized));
  const [archived, setArchived] = useState(mockCandidates.filter((c) => c.finalized));
  const [editedRows, setEditedRows] = useState({});
  const [loadingRow, setLoadingRow] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], status: newStatus } }));
  };

  const handleBonusChange = (id, newBonus) => {
    setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], bonus: newBonus } }));
  };

  const handleSave = (sub) => {
    setLoadingRow(sub.id);
    setTimeout(() => {
      alert(`Updated ${sub.candidate}`);
      setEditedRows((prev) => {
        const n = { ...prev };
        delete n[sub.id];
        return n;
      });
      setLoadingRow(null);
    }, 500);
  };

  const handleRemove = (sub) => {
    if (!window.confirm(`Remove ${sub.candidate}?`)) return;
    setSubmissions((prev) => prev.filter((c) => c.id !== sub.id));
    alert(`Removed ${sub.candidate}`);
  };

  return (
    <div>
      <h2>Candidate Management (Mock Data)</h2>
      <CandidateTable
        submissions={submissions}
        editedRows={editedRows}
        onStatusChange={handleStatusChange}
        onBonusChange={handleBonusChange}
        onSave={handleSave}
        onRemove={handleRemove}
        loadingRow={loadingRow}
      />
      <h3 style={{ marginTop: 24 }}>Completed (Hired / Rejected)</h3>
      <ArchivedTable archived={archived} />
    </div>
  );
}
