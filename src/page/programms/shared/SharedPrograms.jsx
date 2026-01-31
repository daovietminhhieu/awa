import React, { useEffect, useState } from "react";
import {
  getReferralsList,
  getReferralsListForUserById,
  updateReferralStatus,
  updateReferralSteps,
  deleteSharedProgramsById
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

const STATUS_OPTIONS = ["approve", "reject", "ongoing"];
const STEP_OPTIONS = ["completed", "rejected"];

/* =====================
   COMPONENT
===================== */

export default function SharedPrograms() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [sharedProgramms, setSharedProgramms] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 

  /* =====================
     TRANSLATE STATUS
  ===================== */
  const translateStatus = (status) => {
    if (!status) return t("admin.shared.status_values.unknown") || "Unknown";
    const key = status.toLowerCase();
    const translated = t(`admin.shared.status_values.${key}`);
    return translated && translated !== `admin.shared.status_values.${key}`
      ? translated
      : status;
  };

  /* =====================
     LOAD DATA
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
     ACTION HANDLERS
  ===================== */

  const handleUpdateStatus = async (id, status) => {
    await updateReferralStatus(id, status);
    await loadSharedProgramms();
  };

  const handleUpdateSteps = async (id, status) => {
    const steps = checkedSteps[id];
    if (!steps?.length) {
      alert(t("admin.shared.select_steps_required"));
      return;
    }

    await Promise.all(
      steps.map(step =>
        updateReferralSteps(id, status, step)
      )
    );

    setCheckedSteps(prev => ({ ...prev, [id]: [] }));
    await loadSharedProgramms();
  };

  const handleRemoveSharedProgramm = async (id) => {
    await deleteSharedProgramsById(id);
    await loadSharedProgramms();
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

  if (loading) return <p>{t("common.loading") || "Loading..."}</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="shared-container">
      <h3>{t("admin.shared.title")}</h3>

      {sharedProgramms.length === 0 && (
        <p style={{ margin: "20px auto" }}>
          {t("admin.shared.table.no_items")}
        </p>
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
                <td>{prog.progId}</td>
                <td>{prog.recruiterId || "N/A"}</td>
                <td>{prog.candidateId || "N/A"}</td>

                <td className={`status-badge ${prog.status}`}>
                  {translateStatus(prog.status)}
                </td>

                <td>💰 {prog.bonus || 0}</td>
                <td>{formatDateTime(prog.expiresAt)}</td>
                <td>{formatDateTime(prog.updatedAt)}</td>

                {/* STEPS */}
                <td>
                  {prog.steps?.length ? (
                    <div className={`steps-wrapper ${expandedRows[prog.id] ? "expanded" : ""}`}>
                      <ul className="shared-steps">
                        {prog.steps.map(step => (
                          <li key={step.step}>
                            <div>
                              <b>Step {step.step}:</b>{" "}
                              <TranslatableText text={step.name} lang={lang} />
                            </div>
                            <div className="steps-footer">
                              <span className={`step-status ${step.status}`}>
                                {translateStatus(step.status)}
                              </span>
                              <input
                                type="checkbox"
                                checked={checkedSteps[prog.id]?.includes(step.step) || false}
                                onChange={e =>
                                  handleCheckBoxChange(
                                    prog.id,
                                    step.step,
                                    e.target.checked
                                  )
                                }
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <i>{t("admin.shared.not_init")}</i>
                  )}

                  {prog.steps?.length > 2 && (
                    <button
                      className="toggle-steps-btn"
                      onClick={() => toggleRowExpansion(prog.id)}
                    >
                      {expandedRows[prog.id] ? "." : "..."}
                    </button>
                  )}
                </td>

                {/* ACTIONS */}
                <td>
                  <select
                    onChange={e => {
                      const v = e.target.value;
                      if (!v) return;

                      if (STATUS_OPTIONS.includes(v)) {
                        handleUpdateStatus(prog.id, v);
                      } else if (STEP_OPTIONS.includes(v)) {
                        handleUpdateSteps(prog.id, v);
                      } else if (v === "remove") {
                        handleRemoveSharedProgramm(prog.id);
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">
                      {t("admin.shared.option.select")}
                    </option>

                    {user?.role === "admin" && (
                      <>
                        <optgroup label={t("admin.shared.group.status")}>
                          <option value="approve">{translateStatus("approve")}</option>
                          <option value="reject">{translateStatus("reject")}</option>
                          <option value="ongoing">{translateStatus("ongoing")}</option>
                        </optgroup>

                        <optgroup label={t("admin.shared.group.steps")}>
                          <option value="completed">
                            {t("admin.shared.option.mark_completed")}
                          </option>
                          <option value="rejected">
                            {t("admin.shared.option.mark_rejected")}
                          </option>
                        </optgroup>

                        <option value="remove">
                          {t("admin.shared.option.remove")}
                        </option>
                      </>
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
