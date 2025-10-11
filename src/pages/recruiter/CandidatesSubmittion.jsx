import React, { useState, useEffect } from "react";
import CandidateTracker from "../../components/recruiter/management/candidates/CandidateTracker";
import { getPotentialsList } from "../../api";
import { useI18n } from '../../i18n';

import "./CandidatesSubmittion.css";

export default function MyCandidatesMock() {
  const [candidates, setCandidates] = useState([]);
  const [archived, setArchived] = useState([]);
  const { t } = useI18n();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await getPotentialsList(false);
        const list = res?.data || [];

        console.log("📋 Candidate list:", list);

        // Giả sử mỗi candidate có trường "status" hoặc "archived"
        const active = list.filter(c => c.programm?.completed !== "true" && !c.archived);
        const done = list.filter(c => c.programm?.completed === "true" || c.archived);
        console.log(active);
        console.log(done)
        setCandidates(active);
        setArchived(done);
      } catch (err) {
        console.error("❌ Failed to load potentials:", err);
      }
    };

    fetchCandidates();
  }, []);

  return (
    <div style={{ }}>
      <CandidateTracker candidates={candidates} name={t('recruiter.candidates.tracking') || 'Candidate Tracking'} />
      <CandidateTracker candidates={archived} name={t('recruiter.candidates.completed') || 'Completed'} />
    </div>
  );
}
