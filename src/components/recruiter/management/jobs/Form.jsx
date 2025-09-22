import "./Form.css";

export default function CandidateForm({ job, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Submit candidate for {job.title}</h3>
        <form>
          <input type="text" placeholder="Candidate name" />
          <input type="email" placeholder="Email" />
          <input type="tel" placeholder="Phone number" />
          <input type="file" />
          <input type="text" placeholder="LinkedIn profile" />
          <input type="text" placeholder="Portfolio/Website link" />
          <textarea placeholder="Why is the candidate suitable for this position?"></textarea>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Submit Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}
