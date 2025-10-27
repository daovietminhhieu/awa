// src/components/ApplicationForm.js
import React, { useState } from "react";
import { requestASharedLink, sendFilledInformationsForm } from "../api";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";

export function ApplicationForm({ to, translator}) {
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resumeFile: "",
    otherDocs: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await sendFilledInformationsForm(to, form);
      if (result.success) {
        alert("Application submitted successfully!");
        setForm({
          fullName: "",
          email: "",
          phone: "",
          coverLetter: "",
          resumeFile: "",
          otherDocs: [],
        });
      } else {
        alert("Submission failed: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit application form. Please try again later.");
    }
  };

  return (
    <div className="programm-sidebar">
      <h2>{translator('applyform.title')}</h2>
      <form className="apply-form" onSubmit={handleSubmit}>
        <label>{translator('applyform.name')}</label>
        <input
          type="text"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <label>{translator('applyform.phone')}</label>
        <input
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
        />
        <label>{translator('applyform.cover')}</label>
        <textarea
          name="coverLetter"
          rows={4}
          value={form.coverLetter}
          onChange={handleChange}
        />
        <label>{translator('applyform.resume')}</label>
        <input
          type="text"
          name="resumeFile"
          placeholder={translator('applyform.enter_resume')}
          value={form.resumeFile}
          onChange={handleChange}
        />
        <button type="submit">{translator('applyform.submit')}</button>
      </form>
    </div>
  );
}

// src/components/ProgrammOverview.js
export default function ProgrammOverview({ programm, role, to }) {
  const {t} = useI18n();
  const { user: currentUser } = useAuth();
  const tags = [
    { label: t("programm.detail.overview.duration"), value: programm.duration },
    { label: t("programm.detail.overview.degrees"), value: programm.degrees },
    { 
      label: t("programm.detail.overview.type_category"), 
      value: programm.type_category === "job" ? t("programm.detail.overview.job") : t("programm.detail.overview.studium") 
    },
    { label: t("programm.detail.overview.type"), value: programm.type },
    { 
      label: programm.type_category === "job" 
        ? t("programm.detail.overview.expected_salary") 
        : t("programm.detail.overview.fee"),
      value: programm.type_category === "job" 
        ? programm.expected_salary 
        : programm.fee 
    },
    { 
      label: t("programm.detail.overview.status"), 
      value: programm.completed === "true" ? t("programm.detail.overview.enough") : t('programm.detail.overview.hire') 
    },
    { 
      label: t("programm.detail.overview.public_day"), 
      value: new Date(programm.public_day).toLocaleDateString() 
    },
    { 
      label: t("programm.detail.overview.deadline"), 
      value: new Date(programm.deadline).toLocaleDateString() 
    },
  ];


  const specialTags = [];
  if ((role === "recruiter" || role === "admin") && programm.bonus) specialTags.push({ label: t("programm.detail.overview.bonus"), value: programm.bonus, bg: "#ff9800" });
  if (programm.vacancies) specialTags.push({ label: t("programm.detail.overview.vacancies"), value: programm.vacancies, bg: "#4caf50" });
  if (programm.hired) specialTags.push({ label: t("programm.detail.overview.hired"), value: programm.hired, bg: "#4caf50" });

  const handleShareReferrals = async () => {
    console.log(programm._id);
      const res = await requestASharedLink(programm._id);
      console.log(res.data);
      alert("Successfully shared this programm. Wait for candidate to wait and admin to confirm.");
  }

  return (
    <>
      <div className="programm-detail-header">
        <h1 className="programm-detail-title">{programm.title}</h1>
        <div
          className="programm-tags-slider"
          onMouseDown={(e) => {
            const slider = e.currentTarget;
            slider.isDown = true;
            slider.startX = e.pageX - slider.offsetLeft;
            slider.scrollLeftStart = slider.scrollLeft;
            slider.classList.add("active");
          }}
          onMouseLeave={(e) => {
            const slider = e.currentTarget;
            slider.isDown = false;
            slider.classList.remove("active");
          }}
          onMouseUp={(e) => {
            const slider = e.currentTarget;
            slider.isDown = false;
            slider.classList.remove("active");
          }}
          onMouseMove={(e) => {
            const slider = e.currentTarget;
            if (!slider.isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - slider.startX) * 1;
            slider.scrollLeft = slider.scrollLeftStart - walk;
          }}
        >
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="tag"
              style={{ background: tag.bg || "rgba(0,0,0,0.05)" }}
            >
              <b>{tag.label}:</b> {tag.value}
            </span>
          ))}
        </div>
        {/* Tag đặc biệt hiển thị riêng */}
        {specialTags.length > 0 && (
          <div className="programm-tags-special">
            {specialTags.map((tag, idx) => (
              <span key={idx} className="tag" style={{ background: tag.bg }}>
                <b>{tag.label}:</b> {tag.value}
              </span>
            ))}
          </div>
        )}
      </div>


      <div className="programm-body">
        <div className="programm-main">
          <div className="programm-info-boxes">
            <div className="info-box">
              <b>{t('programm.detail.overview.company')}</b>
              <p>{programm.company}</p>
            </div>
            <div className="info-box">
              <b>{t('programm.detail.overview.land')}</b>
              <p>{programm.land}</p>
            </div>
            {currentUser?.role === "recruiter" && (
              <div className="info-box">
                <b>Chia sẻ chương trình này</b>
                <p
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={handleShareReferrals}  // ✅ Corrected here
                >
                  Bấm vào đây để chia sẻ chương trình này
                </p>
              </div>
            )}

          </div>

          <section>
            <h2>{t('programm.detail.overview.overview')}</h2>
            <ul>
              <li><p>{programm.details?.overview || "Không có mô tả."}</p></li>
              <li><p>{programm.details?.other}</p></li>
            </ul>
          </section>

          <section>
            <h2>{t('programm.detail.overview.requirements')}</h2>
            <ul>
              <li>🎂 {t('programm.detail.overview.age')}: {programm.requirement?.age}</li>
              <li>🎓 {t('programm.detail.overview.education')}: {programm.requirement?.education}</li>
              <li>📜 {t('programm.detail.overview.certificate')}: {programm.requirement?.certificate}</li>
              <li>❤️ {t('programm.detail.overview.health')}: {programm.requirement?.health}</li>
            </ul>
          </section>

          <section>
            <h2>{t('programm.detail.overview.benefit')}</h2>
            <ul>
              <li>{programm.benefit}</li>
            </ul>
          </section>

          <section>
            <h2>{t('programm.detail.overview.other')}</h2>
            <ul>
              <li>...</li>
            </ul>
          </section>
        </div>

        {role === "externeCandidate" && <ApplicationForm to={to} translator={t}/>}
      </div>
    </>
  );
}
