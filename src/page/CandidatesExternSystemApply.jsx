import React, { useState } from "react";
import { useI18n } from "../i18n";
import { sendFilledInformationsForm } from "../api";
import "./CandidatesExternSystemApply.css";

function generateRandomId() {
  return crypto.randomUUID();
}

export default function ApplicationForm({ progId, referralId }) {
  const { t } = useI18n();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        referralId: referralId || undefined,
      };

      const result = await sendFilledInformationsForm(progId, payload);

      if (result.success) {
        alert(t("applyform.alert.success"));
        setForm({ name: "", email: "", phone: "" });
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

        <button type="submit">
          {t("applyform.submit")}
        </button>
      </form>
    </div>
  );
}
