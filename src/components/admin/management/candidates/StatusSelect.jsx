import React from "react";

const STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "onboard", label: "Onboard" },
  { value: "rejected", label: "Rejected" },
];

export default function StatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

