import React from "react";
import { useI18n } from "../../../../i18n";
import StatusSelect from "./StatusSelect";
import BonusInput from "./BonusInput";
import ActionButtons from "./ActionButtons";

export function CandidateRow({ sub, edited, onStatusChange, onBonusChange, onSave, onRemove, isLoading }) {
  const { t } = useI18n();
  return (
    <tr>
      <td data-label={t('admin.candidates.table.candidate') || 'Candidate'}>
        {sub.candidate || sub.candidateInfo?.fullName || "-"}
      </td>
      <td data-label={t('admin.candidates.table.programm') || 'Program'}>
        {sub.programm?.title || "-"}
      </td>
      <td data-label={t('admin.candidates.table.referrer') || 'Referrer'}>
        {sub.ctv || "-"}
      </td>
      <td data-label={t('admin.candidates.table.email') || 'Email'}>
        {sub.email || sub.candidateInfo?.email || "-"}
      </td>
      <td data-label={t('admin.candidates.table.phone') || 'Phone'}>
        {sub.phone || sub.candidateInfo?.phone || "-"}
      </td>
      <td data-label={t('admin.candidates.table.cv') || 'CV'}>
        {sub.cvUrl || sub.candidateInfo?.resumeFile ? (
          <a
            href={sub.cvUrl || sub.candidateInfo?.resumeFile}
            target="_blank"
            rel="noopener noreferrer"
          >
            CV
          </a>
        ) : (
          "-"
        )}
      </td>
      <td data-label="Bonus">{sub.bonus || "-"}</td>
    </tr>

  );
}

export function ArchivedRow({ sub }) {
  const { t } = useI18n();

  return (
    <tr>
      <td data-label={t('admin.candidates.table.candidate') || 'Candidate'}>
        {sub.candidate || sub.candidateInfo?.fullName || "-"}
      </td>
      <td data-label={t('admin.candidates.table.programm') || 'Program'}>
        {sub.job || sub.programm?.title || "-"}
      </td>
      <td data-label={t('admin.candidates.table.referrer_short') || 'CTV'}>
        {sub.ctv || "-"}
      </td>
      <td data-label={t('admin.candidates.table.email') || 'Email'}>
        {sub.email || sub.candidateInfo?.email || "-"}
      </td>
      <td data-label={t('admin.candidates.table.phone') || 'Phone'}>
        {sub.phone || sub.candidateInfo?.phone || "-"}
      </td>
      <td data-label={t('admin.candidates.table.cv') || 'CV'}>
        {sub.cvUrl || sub.candidateInfo?.resumeFile ? (
          <a
            href={sub.cvUrl || sub.candidateInfo?.resumeFile}
            target="_blank"
            rel="noopener noreferrer"
          >
            CV
          </a>
        ) : (
          "-"
        )}
      </td>
      <td data-label={t('admin.candidates.table.bonus') || 'Bonus'}>
        ${sub.bonus || "0"}
      </td>
      <td data-label={t('admin.candidates.table.finalized') || 'Finalized'}>
        {sub.finalizedAt ? new Date(sub.finalizedAt).toLocaleString() : "-"}
      </td>
    </tr>

  );
}
