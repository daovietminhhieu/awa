import React from "react";
import { useI18n } from "../../../../i18n";
import {CandidateRow, ArchivedRow} from "./Row";

import './Table.css';

export function CandidateTable({ submissions, editedRows, onStatusChange, onBonusChange, onSave, onRemove, loadingRow }) {
  const { t } = useI18n();
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>{t('admin.candidates.table.candidate') || 'Candidate'}</th>
          <th>{t('admin.candidates.table.programm') || 'Programm'}</th>
          <th>{t('admin.candidates.table.referrer') || 'Referrer'}</th>
          <th>{t('admin.candidates.table.email') || 'Email'}</th>
          <th>{t('admin.candidates.table.phone') || 'Phone'}</th>
          <th>{t('admin.candidates.table.cv') || 'CV'}</th>
          <th>{t('admin.candidates.table.bonus') || 'Bonus'}</th>
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
  const { t } = useI18n();

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>{t('admin.candidates.table.candidate') || 'Candidate'}</th>
          <th>{t('admin.candidates.table.programm') || 'Programm'}</th>
          <th>{t('admin.candidates.table.referrer') || 'CTV'}</th>
          <th>{t('admin.candidates.table.email') || 'Email'}</th>
          <th>{t('admin.candidates.table.phone') || 'Phone'}</th>
          <th>{t('admin.candidates.table.cv') || 'CV'}</th>
          <th>{t('admin.candidates.table.bonus') || 'Bonus'}</th>
          <th>{t('admin.candidates.table.finalized') || 'Finalized'}</th>
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
