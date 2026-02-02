import React, { useEffect, useState } from "react";
import {
  getReferralsList,
  getReferralsListForUserById,
  getReferralById,
  updateReferralStatus,
  updateReferralSteps,
  deleteSharedProgramsById,
  getProgrammById,
  getMyProfile // 👈 dùng đúng API theo ID
} from "../../../api";

import "./SharedPrograms.css";
import { useI18n } from "../../../i18n";
import TranslatableText from "../../../i18n/TranslateableText";
import { useAuth } from "../../../context/AuthContext";

/* =====================
   HELPERS
===================== */
function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* =====================
   COMPONENT
===================== */
export default function SharedPrograms() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [sharedProgramms, setSharedProgramms] = useState([]);
  const [programMap, setProgramMap] = useState({});
  const [userMap, setUserMap] = useState({});

  const [checkedSteps, setCheckedSteps] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =====================
     TRANSLATE STATUS
  ===================== */
  const translateStatus = (status) => {
    if (!status) return "Unknown";
    const translated = t(`admin.shared.status_values.${status}`);
    return translated || status;
  };

  /* =====================
     LOAD SHARED PROGRAMS
  ===================== */
  const loadSharedProgramms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        user.role === "admin"
          ? await getReferralsList()
          : await getReferralsListForUserById(user._id);

      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );

      setSharedProgramms(sorted);
    } catch (err) {
      setError(err.message || "Failed to load shared programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedProgramms();
  }, []);

  /* =====================
     FETCH PROGRAM + USER
     (SIMPLE & CLEAR)
  ===================== */
  useEffect(() => {
    if (!sharedProgramms.length) return;

    const fetchExtraData = async () => {
      /* PROGRAM IDS */
      const progIds = [...new Set(sharedProgramms.map(p => p.progId))];

      /* USER IDS */
      const userIds = [
        ...new Set(
          sharedProgramms
            .flatMap(p => [p.recruiterId, p.candidateId])
            .filter(Boolean)
        )
      ];

      /* FETCH PROGRAMS */
      const programResults = await Promise.all(
        progIds.map(id =>
          getProgrammById(id)
            .then(res => [id, res.data])
            .catch(() => [id, null])
        )
      );
      setProgramMap(Object.fromEntries(programResults));

      /* FETCH USERS */
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
  }, [sharedProgramms]);

  /* =====================
     ACTION HANDLERS
  ===================== */
  const handleUpdateStatus = async (id, status) => {
    await updateReferralStatus(id, status);
    loadSharedProgramms();
  };

  const handleUpdateSteps = async (id, status) => {
    const steps = checkedSteps[id];
    if (!steps?.length) {
      alert(t("admin.shared.select_steps_required"));
      return;
    }

    await Promise.all(
      steps.map(step => updateReferralSteps(id, status, step))
    );

    setCheckedSteps(prev => ({ ...prev, [id]: [] }));
    loadSharedProgramms();
  };

  const handleRemoveSharedProgramm = async (id) => {
    await deleteSharedProgramsById(id);
    loadSharedProgramms();
  };

  const handleGetReferralLink = async (id) => {
    const res = await getReferralById(id);
    const referralLink = `${window.location.origin}${res.data.link}`;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied!");
  };

  const handleCheckBoxChange = (refId, step, checked) => {
    setCheckedSteps(prev => ({
      ...prev,
      [refId]: checked
        ? [...(prev[refId] || []), step]
        : (prev[refId] || []).filter(s => s !== step)
    }));
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* =====================
     RENDER
  ===================== */
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="shared-container">
      <h3>{t("admin.shared.title")}</h3>

      {sharedProgramms.length === 0 && (
        <p>{t("admin.shared.table.no_items")}</p>
      )}

      {sharedProgramms.length > 0 && (
        <table className="shared-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("admin.shared.table.programm")}</th>
              <th>{t("admin.shared.table.recruiter")}</th>
              <th>{t("admin.shared.table.candidate")}</th>
              <th>{t("admin.shared.table.status")}</th>
              <th>{t("admin.shared.table.bonus")}</th>
              <th>{t("admin.shared.table.expires")}</th>
              <th>{t("admin.shared.table.updated")}</th>
              <th>{t("admin.shared.table.steps")}</th>
              <th>{t("admin.shared.table.actions")}</th>
            </tr>
          </thead>

          <tbody>
            {sharedProgramms.map(prog => (
              <tr key={prog.id}>
                <td>{prog.id}</td>
                <td>{programMap[prog.progId]?.name || "—"}</td>
                <td>{userMap[prog.recruiterId]?.name || "N/A"}</td>
                <td>{userMap[prog.candidateId]?.name || "N/A"}</td>

                <td className={`status-badge ${prog.status}`}>
                  {translateStatus(prog.status)}
                </td>

                <td>💰 {prog.bonus || 0}</td>
                <td>{formatDateTime(prog.expiresAt)}</td>
                <td>{formatDateTime(prog.updatedAt)}</td>

                {/* STEPS */}
                <td>
                  {prog.steps?.length ? (
                    <div className="steps-cell">
                      <div
                        className={`steps-wrapper ${
                          expandedRows[prog.id] ? "expanded" : ""
                        }`}
                      >
                        <ul className="shared-steps">
                          {prog.steps.map(step => (
                            <li key={step.step}>
                              <b>Step {step.step}:</b>{" "}
                              <TranslatableText text={step.name} lang={lang} />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {prog.steps.length > 2 && (
                        <button
                          className="toggle-steps-btn"
                          onClick={() => toggleRowExpansion(prog.id)}
                        >
                          {expandedRows[prog.id] ? "Thu gọn ▲" : "Xem thêm ▼"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <i>{t("admin.shared.not_init")}</i>
                  )}
                </td>


                {/* ACTIONS */}
                <td>
                  <select
                    onChange={e => {
                      const v = e.target.value;
                      if (!v) return;

                      if (["approve", "reject", "ongoing"].includes(v)) {
                        handleUpdateStatus(prog.id, v);
                      } else if (["completed", "rejected"].includes(v)) {
                        handleUpdateSteps(prog.id, v);
                      } else if (v === "remove") {
                        handleRemoveSharedProgramm(prog.id);
                      } else if (v === "get_link") {
                        handleGetReferralLink(prog.id);
                      }

                      e.target.value = "";
                    }}
                  >
                    <option value="">{t("admin.shared.option.select")}</option>
                    {user?.role === "admin" ? (
                      <>
                        <option value="approve">{translateStatus("approve")}</option>
                        <option value="reject">{translateStatus("reject")}</option>
                        <option value="ongoing">{translateStatus("ongoing")}</option>
                        <option value="remove">{t("admin.shared.option.remove")}</option>
                      </>
                    ) : (
                      <option value="get_link">
                        {t("admin.shared.option.get_link")|| "Get Referral Link"}
                      </option>
                    )}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
