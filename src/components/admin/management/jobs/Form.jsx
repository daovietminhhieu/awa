import React from "react";
import "./Form.css";

export default function JobForm({ job, handler, buttonText, onSubmit, onCancel }) {
  return (
    <div className="modal">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3>{buttonText === "Create" ? "Add job" : "Edit job"}</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="section">
            <input
              type="text"
              placeholder="Title"
              value={job.title}
              onChange={(e) => handler({ ...job, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Company"
              value={job.company}
              onChange={(e) => handler({ ...job, company: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              value={job.location}
              onChange={(e) => handler({ ...job, location: e.target.value })}
            />
            <input
              type="text"
              placeholder="e.g. JavaScript, React, Remote, Full-time"
              value={job.tags || ""}
              onChange={(e) => handler({ ...job, tags: e.target.value })}
            />
            <input
              type="text"
              placeholder="Salary (e.g: 1000 USD)"
              value={job.salary}
              onChange={(e) => handler({ ...job, salary: e.target.value })}
            />
            <input
              type="text"
              placeholder="Bonus (e.g: 500 USD)"
              value={job.bonus}
              onChange={(e) => handler({ ...job, bonus: e.target.value })}
            />
            <div className="inline-fields">
              <input
                type="number"
                placeholder="USD / Candidate"
                value={job.costPerCandidate || ""}
                onChange={(e) => handler({ ...job, costPerCandidate: e.target.value })}
              />
              <input
                type="number"
                placeholder="+USD / Interview"
                value={job.costPerInterview || ""}
                onChange={(e) => handler({ ...job, costPerInterview: e.target.value })}
              />
            </div>
            <div className="inline-fields">
              <input
                type="number"
                placeholder="Vacancies"
                value={job.vacancies || ""}
                onChange={(e) => handler({ ...job, vacancies: e.target.value })}
              />
              <input
                type="text"
                placeholder="Deadline (YYYY-MM-DD)"
                value={job.deadline || ""}
                onChange={(e) => handler({ ...job, deadline: e.target.value })}
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="section">
            <h4>Job Details</h4>
            <textarea
              placeholder="Job Description"
              value={job.description}
              onChange={(e) => handler({ ...job, description: e.target.value })}
            />
            <textarea
              placeholder="Job Requirements"
              value={job.requirements}
              onChange={(e) => handler({ ...job, requirements: e.target.value })}
            />
            <textarea
              placeholder="Benefits & Perks"
              value={job.benefits}
              onChange={(e) => handler({ ...job, benefits: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn cancel" onClick={onCancel}>Cancel</button>
          <button className="btn submit" onClick={onSubmit}>{buttonText}</button>
        </div>
      </div>
    </div>
  );
}
