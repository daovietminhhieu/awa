import React from "react";
import { useI18n } from "../../../../i18n";

export default function SavedProgramms({ savedProgramsList }) {
  const {t} = useI18n(); 
  
  if (!savedProgramsList.length) {
    return <div>{t('recruiter.saved.not_initialized')}</div>;
  }

  return (
    <div>
      <ul>
        {savedProgramsList.map((p) => (
          <li key={p._id}>
            {p.title || p.name || p._id}
          </li>
        ))}
      </ul>
    </div>
  );
}
