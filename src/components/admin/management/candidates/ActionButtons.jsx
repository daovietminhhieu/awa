import React from "react";
import { useI18n } from "../../../../i18n";

export default function ActionButtons({ sub, onSave, onRemove, isLoading }) {
  const { t } = useI18n();
  return (
    <div className="action-buttons">
      <button onClick={() => onSave(sub)} disabled={isLoading}>
        {isLoading ? <span className="loading-spinner" /> : (t('admin.candidates.actions.update') || 'Update')}
      </button>
      <button onClick={() => onRemove(sub)} className="remove-btn" disabled={isLoading}>
        {t('admin.candidates.actions.remove') || 'Remove'}
      </button>
    </div>
  );
}
