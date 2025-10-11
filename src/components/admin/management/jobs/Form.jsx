import React from "react";
import "./Form.css";
import { useI18n } from "../../../../i18n";

export default function JobForm({ job, handler, buttonText, onSubmit, onCancel }) {
  const { t } = useI18n();
  return (
    <div className="modal">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3>{buttonText === "Create" ? (t('admin.jobs.add') || 'Add job') : (t('admin.jobs.edit') || 'Edit job')}</h3>
          <button className="close-btn" onClick={onCancel}>{t('common.close') || 'Close'}</button>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="section">
            <input
              type="text"
              placeholder={t('admin.jobs.placeholders.title') || 'Title'}
              value={job.title}
              onChange={(e) => handler({ ...job, title: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('admin.jobs.placeholders.company') || 'Company'}
              value={job.company}
              onChange={(e) => handler({ ...job, company: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('admin.jobs.placeholders.location') || 'Location'}
              value={job.location}
              onChange={(e) => handler({ ...job, location: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('admin.jobs.placeholders.tags') || 'e.g. JavaScript, React, Remote, Full-time'}
              value={job.tags || ""}
              onChange={(e) => handler({ ...job, tags: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('admin.jobs.placeholders.salary') || 'Salary (e.g: 1000 USD)'}
              value={job.salary}
              onChange={(e) => handler({ ...job, salary: e.target.value })}
            />
            <input
              type="text"
              placeholder={t('admin.jobs.placeholders.bonus') || 'Bonus (e.g: 500 USD)'}
              value={job.bonus}
              onChange={(e) => handler({ ...job, bonus: e.target.value })}
            />
            <div className="inline-fields">
              <input
                type="number"
                placeholder={t('admin.jobs.placeholders.cost_per_candidate') || 'USD / Candidate'}
                value={job.costPerCandidate || ""}
                onChange={(e) => handler({ ...job, costPerCandidate: e.target.value })}
              />
              <input
                type="number"
                placeholder={t('admin.jobs.placeholders.cost_per_interview') || '+USD / Interview'}
                value={job.costPerInterview || ""}
                onChange={(e) => handler({ ...job, costPerInterview: e.target.value })}
              />
            </div>
            <div className="inline-fields">
              <input
                type="number"
                placeholder={t('admin.jobs.placeholders.vacancies') || 'Vacancies'}
                value={job.vacancies || ""}
                onChange={(e) => handler({ ...job, vacancies: e.target.value })}
              />
                <input
                type="text"
                placeholder={t('admin.jobs.placeholders.deadline') || 'Deadline (YYYY-MM-DD)'}
                value={job.deadline || ""}
                onChange={(e) => handler({ ...job, deadline: e.target.value })}
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="section">
            <h4>{t('admin.jobs.details_title') || 'Job Details'}</h4>
            <textarea
              placeholder={t('admin.jobs.placeholders.description') || 'Job Description'}
              value={job.description}
              onChange={(e) => handler({ ...job, description: e.target.value })}
            />
            <textarea
              placeholder={t('admin.jobs.placeholders.requirements') || 'Job Requirements'}
              value={job.requirements}
              onChange={(e) => handler({ ...job, requirements: e.target.value })}
            />
            <textarea
              placeholder={t('admin.jobs.placeholders.benefits') || 'Benefits & Perks'}
              value={job.benefits}
              onChange={(e) => handler({ ...job, benefits: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn cancel" onClick={onCancel}>{t('common.cancel') || 'Cancel'}</button>
          <button className="btn submit" onClick={onSubmit}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
}
