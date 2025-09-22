import React from "react";

export default function JobCard({ job, onEdit, onDelete }) {
  return (
    <div className="job-card">
      <h3 className="job-title">{job.title}</h3>
      <p><strong>Company:</strong> {job.company || "N/A"}</p>
      <p><strong>Location:</strong> {job.location}</p>
      <p>
        <strong>Salary:</strong> {job.salary}
        {job.bonus && <span className="bonus"> Bonus: {job.bonus}</span>}
      </p>
      <p className={`status ${job.status === "Active" ? "active" : "inactive"}`}>
        Status: {job.status || "Inactive"}
      </p>

      {/* badges */}
      <div className="badges">
        <span className="badge green">USD 0 / Candidate</span>
        <span className="badge blue">+USD 0 / Interview</span>
      </div>

      {/* actions */}
      <div className="actions">
        <button className="btn edit" onClick={() => onEdit(job.id)}>Edit</button>
        <button className="btn delete" onClick={() => onDelete(job.id)}>Delete</button>
        <button className="btn pause">Pause</button>
      </div>
    </div>
  );
}
