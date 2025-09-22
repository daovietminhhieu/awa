import { Link } from "react-router-dom";
import "./Card.css";

export default function CoursesGrid({ title, courses }) {
  return (
    <section className="courses-section">
      <h2 className="courses-title">{title}</h2>
      <div className="courses-grid">
        {courses.map((c, idx) => (
         <Link to={`/courses/${c.id}`} state={{ course: c }} style={{textDecoration:"none"}}>
           <div
            key={idx}
            className="course-card"
            style={{ borderTopColor: c.color }}
          >
            {/* Tiêu đề */}
            <div className="course-header">
              <h3 className="course-title">{c.title}</h3>
            </div>

            {/* Trường */}
            <div className="course-university">
              <img src={c.logo} alt={c.university} className="course-logo" />
              <div>
                <p className="uni-name">{c.university}</p>
                <p className="uni-country">{c.country}</p>
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <ul className="course-info">
              <li>🎓 {c.level}</li>
              <li>📅 {c.duration}</li>
              <li>💰 {c.fee}</li>
            </ul>

            {/* Extra */}
            <div className="course-extra">
              <p className={`course-status ${c.status}`}>
                <b>Status:</b> {c.status}
              </p>
              <p><b>Deadline:</b> {c.deadline}</p>
              
            </div>

            {/* Footer */}
            <div className="course-footer">
              <Link to={`/courses/${c.id}`} state={{ course: c }} className="course-detail-btn">
                Xem chi tiết
              </Link>
            </div>
          </div>
         </Link>
        ))}
      </div>
    </section>
  );
}
