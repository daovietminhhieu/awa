import React from "react";

export default function BonusInput({ value, onChange }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
  );
}
