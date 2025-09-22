import { useParams, useLocation } from "react-router-dom";
import courses from "../mocks/courses"; // danh sách course mẫu
import "./Detail.css";

export default function CourseDetail() {
  const { id } = useParams();
  const location = useLocation();

  const course =
    location.state?.course || courses.find((c) => String(c.id) === id);

  if (!course) return <p>❌ Course not found (id: {id})</p>;

  return (
    <div className="course-detail">

      {/* Banner Header */}
      <div
        className="course-header"
      >
        <h1>{course.title}</h1>
        <div className="course-tags">
          <span className="tag">{course.level}</span>
          <span className="tag">{course.duration}</span>
          {course.tags?.length > 0 && (
            course.tags.map((t, i) => (
              <span key={i} className="tag">{t}</span>
            ))
          )}
        </div>
        <div className="course-tags" style={{marginTop: 20}}>
          <span className="tag" style={{width: "fit-content"}}><b>Status:</b> {course.status}</span>
          <span className="tag" style={{width: "fit-content"}}><b>Deadline:</b> {course.deadline}</span>
        </div>

        <div className="course-tags" style={{marginTop: 20}}>
          <span className="tag" style={{width: "fit-content", background:"#ff9800"}}><b>Bonus:</b> {course.bonus}</span>
          <span className="tag" style={{width: "fit-content", background:"#2196f3"}}><b>Reward:</b> {course.reward}</span>
          <span className="tag" style={{width: "fit-content", background:"#4caf50"}}><b>Vacancies:</b> {course.vacancies}</span>
        </div>
      </div>

      <div className="course-body">
        {/* Nội dung trái */}
        <div className="course-main">
          {/* Info boxes */}
          <div className="course-info-boxes">
            <div className="info-box">
              <b>University</b>
              <p>{course.university}</p>
            </div>
            <div className="info-box">
              <b>Country</b>
              <p>{course.country}</p>
            </div>
            <div className="info-box">
              <b>Fee</b>
              <p>{course.fee}</p>
            </div>
          </div>

          {/* Sections */}
          <section>
            <h2>Course Overview</h2>
            <p>{course.overview}</p>
          </section>

          <section>
            <h2>Requirements</h2>
            <p>{course.requirement}</p>
          </section>

         

  
          <section>
            <h2>Other Information</h2>
            {course.other && (
                <p>{course.other}</p>
              )}
            </section>
        </div>

        {/* Sidebar bên phải */}
        <aside className="course-sidebar">

          {course.jdFileName && (
            <a
              href={course.jdFileName}
              target="_blank"
              rel="noopener noreferrer"
              className="jd-link"
            >
              📄 Course Outline
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
