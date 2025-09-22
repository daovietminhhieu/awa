import React from "react";
import { Link } from "react-router-dom";

export default function CourseList({ courses }) {
  return (
    <div className="courses-grid">
      {courses.map((c) => (
        <Link 
          key={c.id} 
          to={`/courses/${c.id}`} 
          state={{ course: c }}
          className="course-card"
          style={{textDecoration:"none"}}
        >
          <div className="course-header">
            <h3 className="course-title">{c.title}</h3>
            <p className="course-university">
              {c.university} – {c.country}
            </p>
          </div>

          <ul className="course-info">
            <li><b>Level:</b> {c.level}</li>
            <li><b>Duration:</b> {c.duration}</li>
            <li><b>Fee:</b> {c.fee}</li>
            <li><b>Status:</b> {c.status}</li>
            <li><b>Deadline:</b> {c.deadline}</li>
          </ul>

          <div className="course-extra">
            {c.bonus && <p style={{borderRadius:"25px",height:"20px", width: "150px",textAlign:"center",background:"#ff9800"}}><b>Bonus:</b> {c.bonus}</p>}
            {c.reward && <p style={{borderRadius:"25px",height:"20px", width: "150px",textAlign:"center",background:"#2196f3"}}><b>Reward:</b> {c.reward}</p>}
            <p style={{borderRadius:"25px",height:"20px", width: "150px",textAlign:"center",background:"#4caf50"}}><b>Vacancies:</b> {c.vacancies}</p>
          </div>

          <div className="course-footer">
            <button 
              style={{ width: "fit-content", height:"40px" }} 
              onClick={(e) => {
                e.preventDefault(); // tránh Link redirect khi chỉ click button
                alert("Clicked");
              }}
            >
              Referer
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
