import React, { useState, useEffect } from "react";
import CandidateTracker from "../../components/recruiter/management/candidates/CandidateTracker";
import { mockCandidates } from "../../mocks/candidates";

import './CandidatesSubmittion.css';

export default function MyCandidatesMock() {
  const [candidates, setCandidates] = useState([]);
  const [archived, setArchived] = useState([]);
  const [balance, setBalance] = useState(1000); // mock balance

  useEffect(() => {
    // Giả lập fetch API
    const active = mockCandidates.filter((c) => c.status !== "Rejected");
    const done = mockCandidates.filter((c) => c.status === "Rejected");
    setCandidates(active);
    setArchived(done);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <CandidateTracker candidates={candidates} name="Candidate Tracking" />
      <CandidateTracker candidates={archived} name="Completed" />
    </div>
  );
}
