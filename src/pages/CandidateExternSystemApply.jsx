// src/pages/CandidateExternSystemApply.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadProgrammForCandidateExternSystemById } from "../api";
import "./CandidateExternSystemApply.css";
import ProgrammOverview from "../components/ProgrammOverview";

export default function CandidateExternSystemApply() {
  const { id } = useParams();
  const [programm, setProgramm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await loadProgrammForCandidateExternSystemById(id);
        const data = res?.data?.programm;
        setProgramm(data);
      } catch (err) {
        console.error("Failed to load programm:", err);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (!programm) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div className="candidate-apply">
      <ProgrammOverview programm={programm} role="externeCandidate" to={id}/>
    </div>
  );
}
