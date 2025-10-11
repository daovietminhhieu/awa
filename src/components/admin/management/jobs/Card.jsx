import React from "react";
import { useI18n } from "../../../../i18n";

export default function JobCard({ job, onEdit, onDelete }) {
  const { t } = useI18n();
  return (
    <div className="job-card">
      <h3 className="job-title">{job.title}</h3>
      <p><strong>{t('admin.jobs.labels.company') || 'Company:'}</strong> {job.company || "N/A"}</p>
      <p><strong>{t('admin.jobs.labels.location') || 'Location:'}</strong> {job.location}</p>
      <p>
        <strong>{t('admin.jobs.labels.salary') || 'Salary:'}</strong> {job.salary}
        {job.bonus && <span className="bonus"> {t('admin.jobs.labels.bonus') || 'Bonus:'} {job.bonus}</span>}
      </p>
      <p className={`status ${job.status === "Active" ? "active" : "inactive"}`}>
        {t('admin.jobs.labels.status') || 'Status:'} {job.status || "Inactive"}
      </p>

      {/* badges */}
      <div className="badges">
        <span className="badge green">{t('admin.jobs.badges.cost_per_candidate') || 'USD 0 / Candidate'}</span>
        <span className="badge blue">{t('admin.jobs.badges.cost_per_interview') || '+USD 0 / Interview'}</span>
      </div>

      {/* actions */}
      <div className="actions">
        <button className="btn edit" onClick={() => onEdit(job.id)}>{t('admin.jobs.actions.edit') || 'Edit'}</button>
        <button className="btn delete" onClick={() => onDelete(job.id)}>{t('admin.jobs.actions.delete') || 'Delete'}</button>
        <button className="btn pause">{t('admin.jobs.actions.pause') || 'Pause'}</button>
      </div>
    </div>
  );
}
