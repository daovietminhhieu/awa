// 📁 ListOfSharedProgramms.jsx
import React, { useEffect, useState } from "react";
import {
  getReferralsList,
  updateReferralStatus,
  updateReferralSteps, deleteSharedProgramsById
} from "../../../api";
import "./SharedPrograms.css";
import { useI18n } from "../../../i18n";
import TranslatableText from "../../../i18n/TranslateableText";
import {useAuth} from "../../../context/AuthContext";

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function SharedPrograms() {
  const { t, lang } = useI18n();
  const {user} = useAuth();
  const [sharedProgramms, setSharedProgramms] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // 🔥 Hàm dịch chính xác status theo admin.shared.status_values
  const translateStatus = (status) => {
    if (!status) return t("admin.shared.status_values.unknown") || "Unknown";

    const key = status.toLowerCase();
    const translated = t(`admin.shared.status_values.${key}`);

    // Nếu không tìm thấy -> trả lại nguyên bản
    if (!translated || translated === `admin.shared.status_values.${key}`) {
      return status;
    }
    return translated;
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    loadSharedProgramms();
  }, []);

  const loadSharedProgramms = async () => {
    setLoading(true);
    try {
      const res = await getReferralsList();
      const sorted = res.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });
      console.log(sorted);
      setSharedProgramms(sorted);
    } catch (err) {
      setError(err.message || "Failed to load shared programms");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateReferralStatus(id, newStatus);
      alert(
        t("admin.shared.alert.status_updated", { status: translateStatus(newStatus) }) ||
          `✅ Status updated to "${newStatus}"`
      );
    } catch (err) {
      alert(
        t("admin.shared.alert.update_failed", { error: err.message }) ||
          "Failed to update status: " + err.message
      );
    }
  };

  const handleUpdateSteps = async (id, newStep) => {
    const stepsToUpdate = checkedSteps[id];
    if (!stepsToUpdate || stepsToUpdate.length === 0) {
      alert(
        t("admin.shared.select_steps_required") ||
          "Please select at least one step to update."
      );
      return;
    }
    try {
      for (const stepNumber of stepsToUpdate) {
        await updateReferralSteps(id, newStep, stepNumber);
      }
      alert(
        t("admin.shared.alert.steps_updated", {
          count: stepsToUpdate.length,
          step: translateStatus(newStep),
        }) || `Updated ${stepsToUpdate.length} steps`
      );
      setCheckedSteps((prev) => ({ ...prev, [id]: [] }));
    } catch (err) {
      alert(
        t("admin.shared.alert.update_steps_failed", { error: err.message }) ||
          "Failed to update steps"
      );
    }
  };

  const handleRemoveSharedProgramm = async (id) => {
    try {
      await deleteSharedProgramsById(id);
      alert(
        t("admin.shared.alert.remove_updated", { status: translateStatus("remove") }) ||
          `✅ Status updated to "remove"`
      );
    } catch (err) {
      alert(
        t("admin.shared.alert.remove_failed", { error: err.message }) ||
          "Failed to remove shared programm: " + err.message
      );
    }
  };

  const handleCheckBoxChange = (referralId, stepId, checked) => {
    setCheckedSteps((prev) => {
      const prevSteps = prev[referralId] || [];
      return {
        ...prev,
        [referralId]: checked
          ? [...prevSteps, stepId]
          : prevSteps.filter((s) => s !== stepId),
      };
    });
  };


  return (
    <div className="shared-container">
      <h3>{t("admin.shared.title")}</h3>

      {loading && <p>{t("common.loading") || "Loading..."}</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && sharedProgramms.length === 0 && (
        <p style={{margin:"20px auto"}}>{t("admin.shared.table.no_items")}</p>
      )}

      {!loading && !error && sharedProgramms.length > 0 && (
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
            {sharedProgramms.map((prog) => (
              <tr key={prog._id}>
                <td>...</td>
                <td><TranslatableText text={prog.programm?.title} lang={lang} /></td>
                <td>{prog.recruiter?.name || "N/A"}</td>
                <td>
                  {prog.candidate?.name || prog.candidateInfo?.fullName || "N/A"}
                </td>

                {/* STATUS — dùng translateStatus() */}
                <td className={`status-badge ${prog.status?.toLowerCase()}`}>
                  {translateStatus(prog.status)}
                </td>

                <td>💰 {prog.bonus || 0}</td>
                <td>{formatDateTime(prog.expiresAt)}</td>
                <td>{formatDateTime(prog.updatedAt)}</td>

                <td data-label="Steps">
                  <div className="steps-cell">

                    <div
                      className={`steps-wrapper ${
                        expandedRows[prog._id] ? "expanded" : ""
                      }`}
                    >
                      {prog.steps?.length ? (
                        <ul className="shared-steps">
                          {prog.steps.map((step) => (
                            <li key={step.step} className="shared-step-item">
                              <div className="step-name">
                                <b>Step {step.step}:</b>
                                <span>
                                  <TranslatableText text={step.name} lang={lang} />
                                </span>
                              </div>

                              <div className="steps-footer">
                                <span className={`step-status ${step.status}`}>
                                  {translateStatus(step.status)}
                                </span>

                                <input
                                  style={{ height: "fit-content" }}
                                  type="checkbox"
                                  checked={
                                    checkedSteps[prog._id]?.includes(step.step) || false
                                  }
                                  onChange={(e) =>
                                    handleCheckBoxChange(
                                      prog._id,
                                      step.step,
                                      e.target.checked
                                    )
                                  }
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <i>{t("admin.shared.not_init")}</i>
                      )}
                    </div>

                    {/* 🔽 nút expand / collapse */}
                    {prog.steps?.length > 2 && (
                      <button
                        className="toggle-steps-btn"
                        onClick={() => toggleRowExpansion(prog._id)}
                        aria-expanded={!!expandedRows[prog._id]}
                      >
                        {expandedRows[prog._id] ? "." : "..."}
                      </button>
                    )}
                  </div>
                </td>


                {/* ACTIONS */}
                <td>
                    <select
                        onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;

                            const statusOptions = ["approve", "reject", "ongoing"];
                            const stepOptions = ["completed", "rejected"];

                            if (statusOptions.includes(value)) {
                            handleUpdateStatus(prog._id, value);
                            } else if (stepOptions.includes(value)) {
                            handleUpdateSteps(prog._id, value);
                            } else if(value === "remove"){
                                handleRemoveSharedProgramm(prog._id);
                            }

                            e.target.value = "";
                        }}
                        >
                            {user?.role === "admin" && (
                                <>
                                <option value="">{t("admin.shared.option.select")}</option>

                                <optgroup label={t("admin.shared.group.status")}>
                                    <option value="approve">{translateStatus("approve")}</option>
                                    <option value="reject">{translateStatus("reject")}</option>
                                    <option value="ongoing">{translateStatus("ongoing")}</option>
                                </optgroup>

                                <optgroup label={t("admin.shared.group.steps")}>
                                    <option value="completed">{t("admin.shared.option.mark_completed")}</option>
                                    <option value="rejected">{t("admin.shared.option.mark_rejected")}</option>
                                </optgroup>

                                <option value="remove">{t("admin.shared.option.remove")}</option>
                                </>
                            )}
                            {user?.role !== "admin" && (
                                <>
                                <option value="">{t("admin.shared.option.select")}</option>

                                <optgroup label={t("admin.shared.group.status")}>
                                    <option value="approve">{t("admin.shared.table.not_available")}</option>                                    
                                </optgroup>
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
