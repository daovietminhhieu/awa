import React from "react";

import { useI18n } from "../../../../i18n";

export default function CandidateRow({ candidate: c }) {
  const {t} = useI18n();
  
  return (
    <tr>
      <td data-label="Name">{c.candidateInfo?.fullName}</td>
      <td data-label="Programm">{c.programm?.title}</td>
      <td data-label="Salary">{c.programm?.expected_salary || "-"}</td>
      <td data-label="Status">
        {c.programm?.completed
          ? (c.programm?.completed === "true"
              ? t("recruiter.candidates.table.statusvalue.completed")
              : t("recruiter.candidates.table.statusvalue.notcompleted"))
          : "-"}
      </td>

      <td data-label="Bonus">{c.programm?.bonus || "-"}</td>
      <td data-label="Email">{c.candidateInfo?.email || "-"}</td>
      <td data-label="Phone">{c.candidateInfo?.phone || "-"}</td>
      <td data-label="CV">
        {c.cv ? (
          <a href={c.cvUrl} target="_blank" rel="noopener noreferrer">
            {c.cv}
          </a>
        ) : (
          "-"
        )}
      </td>
      <td data-label="LinkedIn">
        {c.linkedin ? <a href={c.linkedin}>Link</a> : "-"}
      </td>
      <td data-label="Portfolio">
        {c.portfolio ? <a href={c.portfolio}>Link</a> : "-"}
      </td>
      <td data-label="Time">
        {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
      </td>
    </tr>
  );
}
