import React from "react";
import { useI18n } from "../../../../i18n";

export default function BonusInput({ value, onChange }) {
  const { t } = useI18n();
  return (
    <input type="text" placeholder={t('admin.candidates.bonus_placeholder') || ''} value={value} onChange={(e) => onChange(e.target.value)} />
  );
}
