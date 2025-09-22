import { useLocation } from "react-router-dom";
import "./JobDetail.css";

export default function JobDetail() {
  
  const location = useLocation();
  const { job } = location.state || {};
  if (!job) return <p>No job selected</p>;

  return (

    <div className="job-detail">
    <div className="job-header">
      {/* Left Info */}
      <div className="job-info">
        <h1 className="job-title">{job.title}</h1>
  
        {/* Tags */}
        <div className="job-tags">
          {job.tags?.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
  
        {/* Summary */}
        <div className="job-summary">
          <div className="info-box">
            <p className="label">💰 Salary</p>
            <p className="value">{job.salary}</p>
          </div>
          <div className="info-box">
            <p className="label">📍 Location</p>
            <p className="value">{job.location}</p>
          </div>
          <div className="info-box">
            <p className="label">🎁 Reward</p>
            <p className="value">{job.reward}</p>
          </div>
        </div>
      </div>
  
      {/* Right Actions */}
      <div className="job-actions">
        <div className="action-card">
          <button className="submit-btn">🚀 Submit Candidate</button>
          {job.jdFile && (
            <a href={job.jdFile} target="_blank" rel="noreferrer" className="jd-link">
              📄 {job.jdFileName}
            </a>
          )}
        </div>
      </div>
    </div>
  
    {/* Job Sections */}
    <div className="job-section">
      <h2>Job Overview And Responsibility</h2>
      <p>{job.overview}</p>
    </div>
  
    <div className="job-section">
      <h2>Required Skills and Experience</h2>
      <ul>
        {job.skills?.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  
    <div className="job-section">
      <h2>Why Candidate should apply this position</h2>
      <p>{job.whyApply}</p>
    </div>
  
    {job.other && (
      <div className="job-section">
        <h2>Other</h2>
        <p>{job.other}</p>
      </div>
    )}
  </div>
  
    );
}
