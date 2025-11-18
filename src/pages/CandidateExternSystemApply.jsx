// src/pages/CandidateExternSystemApply.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReferralBySlug } from "../api";
import "./CandidateExternSystemApply.css";
import ProgrammOverview from "../components/ProgrammOverview";

export default function CandidateExternSystemApply() {
  const { slug } = useParams(); // chỉ dùng slug
  const [programm, setProgramm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramm = async () => {
      try {
        const data = await getReferralBySlug(slug);
        setProgramm(data);
      } catch (err) {
        console.error("Failed to load programm by slug:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProgramm();
  }, [slug]);

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;
  if (!programm) return <p style={{ padding: "2rem" }}>Programm not found.</p>;

  return (
    <div className="candidate-apply">
      <ProgrammOverview programm={programm} role="externeCandidate" to={slug} />
    </div>
  );
}
