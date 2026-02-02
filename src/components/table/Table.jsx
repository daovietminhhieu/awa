import { useEffect } from "react";
import { getMyProfile } from "../../api";
import { useI18n } from "../../i18n";
import { useState } from "react";


export function CandidateRow({ sub }) {
  return (
    <>
    {/* {console.log("Sub:", sub)} */}
    <tr>
      <td>{sub.candidate?.name || "-"}</td>
      <td>{sub.program?.name || "-"}</td>
      <td>{sub.recruiter?.name || "-"}</td>
      <td>{sub.candidate?.email || "-"}</td>
      <td>{sub.candidate?.phone || "-"}</td>
      <td>
        {sub.candidate?.cv ? (
          <a href={sub.candidate.cv} target="_blank" rel="noreferrer">view</a>
        ) : "-"}
      </td>
      <td>{sub.bonus}</td>
      <td>{new Date(sub.updatedAt).toLocaleString()}</td>
    </tr>
    </>
  );
}

export function ArchivedRow({ sub }) {
  return (
    <>
    {/* {console.log("Archived Sub:", sub)} */}
    <tr>
      <td>{sub.candidate?.name || "-"}</td>
      <td>{sub.program?.name || "-"}</td>
      <td>{sub.recruiter?.name || "-"}</td>
      <td>{sub.candidate?.email || "-"}</td>
      <td>{sub.candidate?.phone || "-"}</td>
      <td>
        {sub.candidate?.cv ? (
          <a href={sub.candidate.cv} target="_blank" rel="noreferrer">CV</a>
        ) : "-"}
      </td>
      <td>${sub.bonus}</td>
      <td>{new Date(sub.updatedAt).toLocaleString()}</td>
    </tr></>
  );
}



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
          <th>{t('admin.candidates.table.finalized') || 'Finalized'}</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((sub) => (
          <CandidateRow key={sub.id} sub={sub} />
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
          <th>{t('admin.candidates.table.referrer') || 'Recruiter'}</th>
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
