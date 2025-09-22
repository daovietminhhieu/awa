import React from "react";
import CandidateTable from "./Table";

export default function CandidateTracker({ candidates, name }) {
  return (
    <div className="candidate-tracker" style={{ marginBottom: 32 }}>
      <h2>{name}</h2>
      <div className="table-container">
        <CandidateTable candidates={candidates} />
      </div>
    </div>
  );
}
