import React from "react";

export default function CandidateRow({ candidate: c }) {
  return (
    <tr>
      <td data-label="Name">{c.candidate}</td>
      <td data-label="Job">{c.job}</td>
      <td data-label="Salary">{c.salary || "-"}</td>
      <td data-label="Status">{c.status}</td>
      <td data-label="Bonus">{c.bonus || "-"}</td>
      <td data-label="Email">{c.email || "-"}</td>
      <td data-label="Phone">{c.phone || "-"}</td>
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
