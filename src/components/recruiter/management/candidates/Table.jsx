import React from "react";
import CandidateRow from "./CandidateRow";
import { useI18n } from "../../../../i18n";

import './Table.css';

export default function Table({ candidates }) {
  const {t} = useI18n();
  
  return (
    <table className="responsive-table">
      <thead>
        <tr>
          <th>{t('recruiter.candidates.table.candidate')}</th>
          <th>{t('recruiter.candidates.table.programm')}</th>
          <th>{t('recruiter.candidates.table.expected_salary')}</th>
          <th>{t('recruiter.candidates.table.status')}</th>
          <th>{t('recruiter.candidates.table.bonus')}</th>
          <th>{t('recruiter.candidates.table.email')}</th>
          <th>{t('recruiter.candidates.table.phone')}</th>
          <th>{t('recruiter.candidates.table.cv')}</th>
          <th>{t('recruiter.candidates.table.linkedin')}</th>
          <th>{t('recruiter.candidates.table.portfolio')}</th>
          <th>{t('recruiter.candidates.table.time')}</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((c) => (
          <CandidateRow key={c.id} candidate={c} />
        ))}
      </tbody>
    </table>
  );
}
