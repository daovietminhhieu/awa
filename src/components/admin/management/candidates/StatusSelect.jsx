import React from "react";
import { useI18n } from "../../../../i18n";

const STATUS_OPTIONS_KEYS = [
  { value: "submitted", key: 'admin.candidates.status.submitted' },
  { value: "interviewing", key: 'admin.candidates.status.interviewing' },
  { value: "offer", key: 'admin.candidates.status.offer' },
  { value: "hired", key: 'admin.candidates.status.hired' },
  { value: "onboard", key: 'admin.candidates.status.onboard' },
  { value: "rejected", key: 'admin.candidates.status.rejected' },
];

export default function StatusSelect({ value, onChange }) {
  const { t } = useI18n();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {STATUS_OPTIONS_KEYS.map((s) => (
        <option key={s.value} value={s.value}>
          {t(s.key) || s.key.split('.').pop()}
        </option>
      ))}
    </select>
  );
}

