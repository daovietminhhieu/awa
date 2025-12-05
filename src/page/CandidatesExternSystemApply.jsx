import React, { useState } from "react";
import { useI18n } from "../i18n";
import { sendFilledInformationsForm } from "../api";

export default function ApplicationForm({ to, translator }) {
  const { t } = useI18n();
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
        alert(t('applyform.alert.success'));
        setForm({
          fullName: "",
          email: "",
          phone: "",
          coverLetter: "",
          resumeFile: "",
          otherDocs: [],
        });
      } else {
        alert(t('applyform.failed') + (result.message || t('applyform.unknown')));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert(t('applyform.error'));
    }
  };

  return (
    <div className="programm-sidebar">
      <h2>{translator("applyform.title")}</h2>
      <form className="apply-form" onSubmit={handleSubmit}>
        <label>{translator("applyform.name")}</label>
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
        <label>{translator("applyform.phone")}</label>
        <input
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
        />
        <label>{translator("applyform.cover")}</label>
        <textarea
          name="coverLetter"
          rows={4}
          value={form.coverLetter}
          onChange={handleChange}
        />
        <label>{translator("applyform.resume")}</label>
        <input
          type="text"
          name="resumeFile"
          placeholder={translator("applyform.enter_resume")}
          value={form.resumeFile}
          onChange={handleChange}
        />
        <button type="submit">{translator("applyform.submit")}</button>
      </form>
    </div>
  );
}

