import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProgrammsGrid.css";

export default function ProgrammsGrid({ title, programms = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!programms.length)
    return <p style={{ textAlign: "center" }}>Không có chương trình nào phù hợp.</p>;

  const totalPages = Math.ceil(programms.length / itemsPerPage);
  const current = programms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="programms-section">
      <div className="programms-header">
        <h2 >Danh sách chương trình</h2><h3 className="programms-title">{title}</h3> 
      </div>
      <div className="programms-grid">
        {current.map((p) => (
          <Link key={p._id} to={`/programm/${p._id}`} className="course-link">
            <div className="course-card">
              <div className="course-header">
                <h3>{p.title}</h3>
              </div>
              <div className="course-university">
                <img src={p.logoL} alt={p.company} className="course-logo" />
                <div>
                  <p className="uni-name">{p.company}</p>
                  <p className="uni-country">{p.land}</p>
                </div>
              </div>
              <ul className="course-info">
                <li>🎓 {p.degrees}</li>
                <li>📅 {p.duration}</li>
                <li>💰 {p.fee}</li>
              </ul>
              <p>
                <b>Lương dự kiến:</b> {p.expected_salary || "—"}
              </p>
              <p>
                <b>Deadline:</b>{" "}
                {p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`pagination-btn ${num === currentPage ? "active" : ""}`}
          >
            {num}
          </button>
        ))}
      </div>
    </section>
  );
}
