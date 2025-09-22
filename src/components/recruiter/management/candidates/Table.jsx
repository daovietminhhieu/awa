import React from "react";
import CandidateRow from "./CandidateRow";

import './Table.css';

export default function Table({ candidates }) {
  return (
    <table className="responsive-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Job</th>
          <th>Salary</th>
          <th>Status</th>
          <th>Bonus</th>
          <th>Email</th>
          <th>Phone</th>
          <th>CV</th>
          <th>LinkedIn</th>
          <th>Portfolio</th>
          <th>Time</th>
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
