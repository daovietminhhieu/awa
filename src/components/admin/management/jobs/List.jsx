import React from "react";
import JobCard from "./Card";
import JobForm from "./Form";
import { useI18n } from "../../../../i18n";

export default function JobList({ jobs, editingJob, setJobs, setEditingJob, handleDelete, handleUpdate }) {
  const { t } = useI18n();
  return (
    <div className="job-grid">
      {jobs.map((job) => (
        <div key={job.id}>
          {editingJob === job.id ? (
            <JobForm
              job={job}
              handler={(updatedJob) =>
                setJobs(jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)))
              }
              buttonText={t('admin.jobs.update') || 'Update'}
              onSubmit={() => handleUpdate(job)}
              onCancel={() => setEditingJob(null)}
            />
          ) : (
            <JobCard
              job={job}
              onEdit={(id) => setEditingJob(id)}
              onDelete={handleDelete}
            />
          )}
        </div>
      ))}
    </div>
  );
}
