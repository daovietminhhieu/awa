import React from "react";
import './Form.css';

export default function CourseForm({ course, handler, buttonText, onSubmit, onCancel }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    handler({ ...course, [name]: value });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{buttonText} Course</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input type="text" name="title" value={course.title} placeholder="Title" onChange={handleChange} />
          <input type="text" name="university" value={course.university} placeholder="University" onChange={handleChange} />
          <input type="text" name="country" value={course.country} placeholder="Country" onChange={handleChange} />
          <input type="text" name="level" value={course.level} placeholder="Level" onChange={handleChange} />
          <input type="text" name="duration" value={course.duration} placeholder="Duration" onChange={handleChange} />
          <input type="text" name="fee" value={course.fee} placeholder="Fee" onChange={handleChange} />
          <input type="text" name="bonus" value={course.bonus} placeholder="Bonus" onChange={handleChange} />
          <input type="text" name="reward" value={course.reward} placeholder="Reward" onChange={handleChange} />
          <input type="text" name="vacancies" value={course.vacancies} placeholder="Vacancies" onChange={handleChange} />
          <input type="date" name="deadline" value={course.deadline} onChange={handleChange} />
          <textarea name="requirement" value={course.requirement} placeholder="Requirement" onChange={handleChange}></textarea>
          <select name="status" value={course.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="btn-primary">{buttonText}</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
