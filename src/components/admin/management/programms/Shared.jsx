// 📁 ListOfSharedProgramms.jsx
import React, { useEffect, useState } from "react";
import {
  getReferralsList,
  updateReferralStatus,
  updateReferralSteps,
} from "../../../../api";
import "./Shared.css";
import { useI18n } from "../../../../i18n";

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

export default function ListOfSharedProgramms() {
  const { t } = useI18n();
  const [sharedProgramms, setSharedProgramms] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

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
      setSharedProgramms(res.data);
    } catch (err) {
      setError(err.message || "Failed to load shared programms");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateReferralStatus(id, newStatus);
      alert(t('admin.shared.alert.status_updated', { status: newStatus }) || `✅ Status updated to "${newStatus}"`);
    } catch (err) {
      alert(t('admin.shared.alert.update_failed', { error: err.message }) || "Failed to update status: " + err.message);
    }
  };

  const handleUpdateSteps = async (id, newStep) => {
    const stepsToUpdate = checkedSteps[id];
    if (!stepsToUpdate || stepsToUpdate.length === 0) {
      alert(t('admin.shared.select_steps_required') || "Please select at least one step to update.");
      return;
    }
    try {
      for (const stepNumber of stepsToUpdate) {
        await updateReferralSteps(id, newStep, stepNumber);
      }
      alert(t('admin.shared.alert.steps_updated', { count: stepsToUpdate.length, step: newStep }) || `✅ Updated ${stepsToUpdate.length} step(s) to "${newStep}".`);
      setCheckedSteps((prev) => ({ ...prev, [id]: [] }));
    } catch (err) {
      alert(t('admin.shared.alert.update_steps_failed', { error: err.message }) || "Failed to update steps: " + err.message);
    }
  };

  const handleUpdatePayment = async (id, amount) => {
    console.log("id, amount: ", id, amount);
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
      <h3>{t('admin.shared.title') || 'Shared Programms Status'}</h3>

      {loading && <p>{t('common.loading') || 'Loading...'}</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && sharedProgramms.length === 0 && (
        <p>{t('admin.shared.no_items') || 'No shared programms found.'}</p>
      )}

      {!loading && !error && sharedProgramms.length > 0 && (
        <table className="shared-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('admin.shared.table.programm') || 'Program'}</th>
              <th>{t('admin.shared.table.recruiter') || 'Recruiter'}</th>
              <th>{t('admin.shared.table.candidate') || 'Candidate'}</th>
              <th>{t('admin.shared.table.status') || 'Status'}</th>
              <th>{t('admin.shared.table.bonus') || 'Bonus'}</th>
              <th>{t('admin.shared.table.expires') || 'Expires'}</th>
              <th>{t('admin.shared.table.steps') || 'Steps'}</th>
              <th>{t('admin.shared.table.actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {sharedProgramms.map((prog) => (
              <tr
                key={prog._id}
                className={`shared-row ${expandedRows[prog._id] ? "expanded" : ""}`}
              >
                <td data-label={t('admin.shared.table.id') || 'ID'}>
                  <div className="cell-inner">...</div>
                </td>

                <td data-label={t('admin.shared.table.programm') || 'Program'}>
                  <div className="cell-inner">
                    <span>{prog.programm?.title || "N/A"}</span>
                  </div>
                </td>

                <td data-label={t('admin.shared.table.recruiter') || 'Recruiter'}>
                  <div className="cell-inner">
                    <span>{prog.recruiter?.name || "N/A"}</span>
                  </div>
                </td>

                <td data-label={t('admin.shared.table.candidate') || 'Candidate'}>
                  <div className="cell-inner">
                    <span>
                      {prog.candidate?.name ||
                        prog.candidateInfo?.fullName ||
                        "N/A"}
                    </span>
                  </div>
                </td>

                <td
                  data-label={t('admin.shared.table.status') || 'Status'}
                  className={`status-badge ${prog.status?.toLowerCase()}`}
                >
                  <div className="cell-inner">{prog.status}</div>
                </td>

                <td data-label={t('admin.shared.table.bonus') || 'Bonus'}>
                  <div className="cell-inner">💰 {prog.bonus || 0}</div>
                </td>

                <td data-label={t('admin.shared.table.expires') || 'Expires'}>
                  <div className="cell-inner">{formatDateTime(prog.expiresAt)}</div>
                </td>

                <td data-label={t('admin.shared.table.steps') || 'Steps'}>
                  <div
                    className={`steps-wrapper ${expandedRows[prog._id] ? "expanded" : ""}`}
                  >
                    {prog.steps?.length ? (
                      <>
                        <ul className="shared-steps">
                          {prog.steps.map((step) => (
                            <li key={step.step} className="shared-step-item">
                              <p className="step-name">
                                <b>
                                  {t("admin.shared.step_label", { n: step.step, defaultValue: `Step ${step.step}:` })}
                                </b>{" "}
                                {step.name}

                              </p>
                              <div className="steps-footer">
                                <span className={`step-status ${step.status}`}>
                                  {step.status.replace("_", " ")}
                                </span>
                                <input
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

                        {/* Nút xem thêm / ẩn */}
                        <button
                          className="toggle-steps-btn"
                          onClick={() => toggleRowExpansion(prog._id)}
                          aria-expanded={!!expandedRows[prog._id]}
                        >
                          {expandedRows[prog._id]
                            ?  "."
                            :  "..."}
                        </button>
                      </>
                    ) : (
                      <i>{t("admin.shared.not_initialized") || "Not initialized"}</i>
                    )}
                  </div>
                </td>


                <td data-label="Actions" className="actions-cell">
                  <div className="cell-inner">
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) return;

                      const statusOptions = ["approve", "reject", "ongoing"];
                      const stepOptions = ["completed", "rejected"];
                      const paymentOption = "paid";

                      if (statusOptions.includes(value)) {
                        handleUpdateStatus(prog._id, value);
                      } else if (stepOptions.includes(value)) {
                        handleUpdateSteps(prog._id, value);
                      } else if (value === paymentOption) {
                        handleUpdatePayment(prog._id, prog.bonus);
                      } else {
                        console.log("Invalid option");
                      }

                      e.target.value = "";
                    }}
                  >
                    <option value="">
                      {t('admin.shared.select_placeholder') || '-- Select --'}
                    </option>
                    <optgroup label={t('admin.shared.group.status') || 'Status'}>
                      <option value="approve">{t('admin.shared.option.approve') || 'Approve'}</option>
                      <option value="reject">{t('admin.shared.option.reject') || 'Reject'}</option>
                      <option value="ongoing">{t('admin.shared.option.ongoing') || 'Ongoing'}</option>
                    </optgroup>
                    <optgroup label={t('admin.shared.group.steps') || 'Steps'}>
                      <option value="completed">{t('admin.shared.option.mark_completed') || 'Mark Completed'}</option>
                      <option value="rejected">{t('admin.shared.option.mark_rejected') || 'Mark Rejected'}</option>
                    </optgroup>
                    <optgroup label={t('admin.shared.group.payment') || 'Payment'}>
                      <option value="paid">{t('admin.shared.option.pay') || 'Pay'}</option>
                    </optgroup>
                  </select>

                  </div>

                 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
