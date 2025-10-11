import React from "react";
import './Form.css';
import { useI18n } from "../../../../i18n";

export default function CourseForm({ course, handler, buttonText, onSubmit, onCancel }) {
  const { t } = useI18n();
  const handleChange = (e) => {
    const { name, value } = e.target;
    handler({ ...course, [name]: value });
  };

  return (
    <div className="modal">
      <div className="modal-content">
  <h3>{buttonText} {t('admin.programms.form.course') || 'Course'}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input type="text" name="title" value={course.title} placeholder={t('admin.programms.form.title') || 'Title'} onChange={handleChange} />
          <input type="text" name="university" value={course.university} placeholder={t('admin.programms.form.university') || 'University'} onChange={handleChange} />
          <input type="text" name="country" value={course.country} placeholder={t('admin.programms.form.country') || 'Country'} onChange={handleChange} />
          <input type="text" name="level" value={course.level} placeholder={t('admin.programms.form.level') || 'Level'} onChange={handleChange} />
          <input type="text" name="duration" value={course.duration} placeholder={t('admin.programms.form.duration') || 'Duration'} onChange={handleChange} />
          <input type="text" name="fee" value={course.fee} placeholder={t('admin.programms.form.fee') || 'Fee'} onChange={handleChange} />
          <input type="text" name="bonus" value={course.bonus} placeholder={t('admin.programms.form.bonus') || 'Bonus'} onChange={handleChange} />
          <input type="text" name="reward" value={course.reward} placeholder={t('admin.programms.form.reward') || 'Reward'} onChange={handleChange} />
          <input type="text" name="vacancies" value={course.vacancies} placeholder={t('admin.programms.form.vacancies') || 'Vacancies'} onChange={handleChange} />
          <input type="date" name="deadline" value={course.deadline} onChange={handleChange} />
          <textarea name="requirement" value={course.requirement} placeholder={t('admin.programms.form.requirement') || 'Requirement'} onChange={handleChange}></textarea>
          <select name="status" value={course.status} onChange={handleChange}>
            <option value="active">{t('admin.programms.form.status_active') || 'Active'}</option>
            <option value="inactive">{t('admin.programms.form.status_inactive') || 'Inactive'}</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="btn-primary">{buttonText}</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>{t('common.cancel') || 'Cancel'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
