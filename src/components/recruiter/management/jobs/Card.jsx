import "./Card.css";
import { useNavigate } from "react-router-dom";

export default function Card({ job, onSubmit  }) {
  const navigate = useNavigate();
  const toDetail = () => {
    navigate("/recruiter/jobdetail", { state: { job } });
  }

  return (
    <div className="card" onClick={toDetail}>
      <h2 className="card-title">{job.title}</h2>
      <div className="card-info">
        <p><span>Company:</span> {job.company}</p>
        <p><span>Location:</span> {job.location}</p>
        <p><span>Salary:</span> {job.salary}</p>
      </div>
      <div className="card-tags">
        {job.tags.map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
      </div>
      <div className="card-footer">
        <span className="bonus">💰 Bonus: {job.bonus}</span>
        <button className="submit-btn" onClick={onSubmit} title="Submit candidate">Submit</button>
      </div>
    </div>
  );
}
