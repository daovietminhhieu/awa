import React from "react";
import {CandidateRow, ArchivedRow} from "./Row";

import './Table.css';

export function CandidateTable({ submissions, editedRows, onStatusChange, onBonusChange, onSave, onRemove, loadingRow }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Job</th>
          <th>CTV</th>
          <th>Email</th>
          <th>Phone</th>
          <th>CV</th>
          <th>LinkedIn</th>
          <th>Portfolio</th>
          <th>Status</th>
          <th>Bonus</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((sub) => (
          <CandidateRow
            key={sub.id}
            sub={sub}
            edited={editedRows[sub.id] || {}}
            onStatusChange={onStatusChange}
            onBonusChange={onBonusChange}
            onSave={onSave}
            onRemove={onRemove}
            isLoading={loadingRow === sub.id}
          />
        ))}
      </tbody>
    </table>
  );
}


export function ArchivedTable({ archived }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Job</th>
          <th>CTV</th>
          <th>Email</th>
          <th>Phone</th>
          <th>CV</th>
          <th>LinkedIn</th>
          <th>Portfolio</th>
          <th>Status</th>
          <th>Bonus</th>
          <th>Salary</th>
          <th>Finalized</th>
        </tr>
      </thead>
      <tbody>
        {archived.map((sub) => (
          <ArchivedRow key={sub.id} sub={sub} />
        ))}
      </tbody>
    </table>
  );
}
