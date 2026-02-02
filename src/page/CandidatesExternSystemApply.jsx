import React, { useState } from "react";
import { useI18n } from "../i18n";
import { sendFilledInformationsForm } from "../api";
import "./CandidatesExternSystemApply.css";

export default function ApplicationForm({ progId, referralId }) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cv: null, // ✅ FILE
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "cv") {
      setForm((prev) => ({
        ...prev,
        cv: files[0], // ✅ File object
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);

      if (form.cv) {
        formData.append("cv", form.cv); // ✅ gửi file
      }

      if (referralId) {
        formData.append("referralId", referralId);
      }

      console.log("Submitting FormData...");

      const result = await sendFilledInformationsForm(progId, formData);

      if (result.success) {
        alert(t("applyform.alert.success"));
        setForm({ name: "", email: "", phone: "", cv: null });
      } else {
        alert(
          t("applyform.failed") +
            (result.message || t("applyform.unknown"))
        );
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert(t("applyform.error"));
    }
  };

  return (
    <div className="programm-sidebar">
      <h2>{t("applyform.title")}</h2>

      <form className="apply-form" onSubmit={handleSubmit}>
        <label>{t("applyform.name")}</label>
        <input
          type="text"
          name="name"
          required
          value={form.name}
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

        <label>{t("applyform.phone")}</label>
        <input
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
        />

        <label>File CV</label>
        <input
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
        />

        <div style={{ height: 20 }} />

        <button type="submit">
          {t("applyform.submit")}
        </button>
      </form>
    </div>
  );
}
