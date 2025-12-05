import { useI18n } from "../../i18n";

export function CandidateRow({ sub}) {
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
