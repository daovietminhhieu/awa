import React from "react";
import StatusSelect from "./StatusSelect";
import BonusInput from "./BonusInput";
import ActionButtons from "./ActionButtons";

export function CandidateRow({ sub, edited, onStatusChange, onBonusChange, onSave, onRemove, isLoading }) {
  return (
    <tr>
      <td data-label="Candidate">{sub.candidate}</td>
      <td data-label="Job">{sub.job}</td>
      <td data-label="CTV">{sub.ctv}</td>
      <td data-label="Email">{sub.email}</td>
      <td data-label="Phone">{sub.phone}</td>
      <td data-label="Cvurl">{sub.cvUrl ? <a href={sub.cvUrl} target="_blank" rel="noopener noreferrer">CV</a> : "-"}</td>
      <td data-label="Linkedln">{sub.linkedin ? <a href={sub.linkedin}>Link</a> : "-"}</td>
      <td data-label="Portfolio">{sub.portfolio ? <a href={sub.portfolio}>Link</a> : "-"}</td>
      <td data-label="Status">
        <StatusSelect value={edited.status ?? sub.status} onChange={(val) => onStatusChange(sub.id, val)} />
      </td>
      <td data-label="Bonus">
        <BonusInput value={edited.bonus ?? sub.bonus} onChange={(val) => onBonusChange(sub.id, val)} />
      </td>
      <td data-label="Actions">
        <ActionButtons sub={sub} onSave={onSave} onRemove={onRemove} isLoading={isLoading} />
      </td>
    </tr>
  );
}

export function ArchivedRow({ sub }) {
  return (
    <tr>
      <td data-label="Candidate">{sub.candidate}</td>
      <td data-label="Job">{sub.job}</td>
      <td data-label="CTV">{sub.ctv}</td>
      <td data-label="Email">{sub.email}</td>
      <td data-label="Phone">{sub.phone}</td>
      <td data-label="Cvurl">{sub.cvUrl ? <a href={sub.cvUrl} target="_blank" rel="noopener noreferrer">CV</a> : "-"}</td>
      <td data-label="Linkedln">{sub.linkedin ? <a href={sub.linkedin}>Link</a> : "-"}</td>
      <td data-label="Portfolio">{sub.portfolio ? <a href={sub.portfolio}>Link</a> : "-"}</td>
      <td data-label="Status">{sub.status}</td>
      <td data-label="Bonus">${sub.bonus}</td>
      <td data-label="Salary">{sub.salary}</td>
      <td data-label="Finalized">{sub.finalizedAt ? new Date(sub.finalizedAt).toLocaleString() : "-"}</td>
    </tr>
  );
}
