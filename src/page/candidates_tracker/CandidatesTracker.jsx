import React, { useState, useEffect } from "react";
import { CandidateTable, ArchivedTable } from "../../components/table/Table";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import {
  getReferralsList,
  getProgrammById,
  getMyProfile
} from "../../api";
import "./CandidatesTracker.css";

/* =======================
   HELPERS
======================= */
function extractIds(list = [], key) {
  return [...new Set(
    list.map(item => item?.[key]).filter(Boolean)
  )];
}

/* =======================
   COMPONENT
======================= */
export default function CandidatesTracker() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [submissions, setSubmissions] = useState([]);
  const [archived, setArchived] = useState([]);

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [archivedPage, setArchivedPage] = useState(1);
  const archivedPerPage = 10;

  const [programMap, setProgramMap] = useState({});
  const [userMap, setUserMap] = useState({});

  /* =======================
     1. LOAD REFERRALS
  ======================= */
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await getReferralsList(isAdmin);
        const list = res?.data || [];

        const active = list.filter(
          r => r.status === "approve" && !r.archived
        );
        const done = list.filter(
          r => r.status === "reject" || r.archived
        );

        setSubmissions(active);
        setArchived(done);
      } catch (err) {
        console.error("Failed to load candidates:", err);
      }
    };

    fetchCandidates();
  }, [isAdmin]);

  /* =======================
     2. FETCH PROGRAM + USER
     (GIỐNG SharedPrograms)
  ======================= */
  useEffect(() => {
    if (!submissions.length && !archived.length) return;

    const all = [...submissions, ...archived];

    const progIds = extractIds(all, "progId");
    const userIds = [
      ...extractIds(all, "candidateId"),
      ...extractIds(all, "recruiterId"),
    ];

    const fetchExtraData = async () => {
      /* PROGRAMS */
      const programResults = await Promise.all(
        progIds.map(id =>
          getProgrammById(id)
            .then(res => [id, res.data])
            .catch(() => [id, null])
        )
      );
      setProgramMap(Object.fromEntries(programResults));

      /* USERS */
      const userResults = await Promise.all(
        userIds.map(id =>
          getMyProfile(id)
            .then(res => [id, res.data])
            .catch(() => [id, null])
        )
      );
      setUserMap(Object.fromEntries(userResults));
    };

    fetchExtraData();
  }, [submissions.length, archived.length]);

  /* =======================
     3. ENRICH DATA
  ======================= */
  useEffect(() => {
    if (!Object.keys(programMap).length || !Object.keys(userMap).length) return;

    setSubmissions(prev =>
      prev.map(r => ({
        ...r,
        program: programMap[r.progId] || null,
        candidate: userMap[r.candidateId] || null,
        recruiter: userMap[r.recruiterId] || null,
      }))
    );

    setArchived(prev =>
      prev.map(r => ({
        ...r,
        program: programMap[r.progId] || null,
        candidate: userMap[r.candidateId] || null,
        recruiter: userMap[r.recruiterId] || null,
      }))
    );
  }, [programMap, userMap]);

  /* =======================
     FILTER + PAGINATION
  ======================= */
  const filterFn = (c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      c.candidate?.name?.toLowerCase().includes(q) ||
      c.candidate?.email?.toLowerCase().includes(q) ||
      c.program?.name?.toLowerCase().includes(q)
    );
  };

  const filteredActive = submissions.filter(filterFn);
  const filteredArchived = archived.filter(filterFn);

  const currentSubmissions = filteredActive.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentArchived = filteredArchived.slice(
    (archivedPage - 1) * archivedPerPage,
    archivedPage * archivedPerPage
  );

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="ct-page">
      <div className="ct-container">
        <div className="ct-header">
          <div className="ct-tabs">
            <button
              className={`ct-tab ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Approved ({filteredActive.length})
            </button>

            <button
              className={`ct-tab ${activeTab === "archived" ? "active" : ""}`}
              onClick={() => setActiveTab("archived")}
            >
              Archived ({filteredArchived.length})
            </button>
          </div>

          <div className="ct-search">
            <input
              type="text"
              placeholder={t("search") || "Search..."}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
                setArchivedPage(1);
              }}
            />
          </div>
        </div>

        {activeTab === "active" && (
          <div className="ct-card">
            <CandidateTable submissions={currentSubmissions} />
          </div>
        )}

        {activeTab === "archived" && (
          <div className="ct-card">
            <ArchivedTable archived={currentArchived} />
          </div>
        )}
      </div>
    </div>
  );
}
