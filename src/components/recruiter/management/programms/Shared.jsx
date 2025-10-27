import React, { useEffect, useState } from "react";
import {
  getReferralsList,
  getLinkFromReferralById,
} from "../../../../api";
import { useI18n } from "../../../../i18n";
import './Shared.css';

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

export default function ListOfSharedProgramms() {
  const { t } = useI18n();
  const [sharedProgramms, setSharedProgramms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    loadSharedProgramms();
  }, []);

  const loadSharedProgramms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReferralsList();
      setSharedProgramms(res.data);
    } catch (err) {
      setError(err.message || "Failed to load shared programms");
    } finally {
      setLoading(false);
    }
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleGetLink = async (referralId) => {
    try {
      setActionLoading(referralId);
      const res = await getLinkFromReferralById(referralId);
      alert(`🔗 Link: ${res.data?.link || "Not available yet."}`);
    } catch (err) {
      alert("Failed to get link: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActionChange = (referralId, e) => {
    const value = e.target.value;
    if (!value) return;
    if (value === "get_link") handleGetLink(referralId);
    e.target.value = "";
  };

  if (loading) return <p>Loading shared programms...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (sharedProgramms.length === 0) return <p>No shared programms available.</p>;

  return (
    <div className="shared-container">
      <h3>{t("recruiter.shared.title")}</h3>
      <table className="shared-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>{t("recruiter.shared.table.status")}</th>
            <th>{t("recruiter.shared.table.candidate")}</th>
            <th>{t("recruiter.shared.table.programm")}</th>
            <th>{t("recruiter.shared.table.bonus")}</th>
            <th>{t("recruiter.shared.table.created")}</th>
            <th>{t("recruiter.shared.table.updated")}</th>
            <th>{t("recruiter.shared.table.expires")}</th>
            <th>Link</th>
            <th>{t("recruiter.shared.table.steps")}</th>
            <th>{t("recruiter.shared.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sharedProgramms.map((prog) => (
            <tr
              key={prog._id}
              className={`shared-row ${expandedRows[prog._id] ? "expanded" : ""}`}
            >
              <td data-label="ID">...</td>
              <td data-label="Status" className={`status ${prog.status?.toLowerCase()}`}>
                {prog.status}
              </td>
              <td data-label="Candidate">
                {prog.candidate?.name || prog.candidateInfo?.fullName || "N/A"}
              </td>
              <td data-label="Program">{prog.programm?.title || prog.programm}</td>
              <td data-label="Bonus">{prog.bonus || "-"}</td>
              <td data-label="Created">{formatDateTime(prog.createdAt)}</td>
              <td data-label="Updated">{formatDateTime(prog.updatedAt)}</td>
              <td data-label="Expires">{formatDateTime(prog.expiresAt)}</td>
              <td data-label="Link">
                {prog.link
                  ? t("recruiter.shared.table.linkavailable")
                  : t("recruiter.shared.table.linkunavailable")}
              </td>

              {/* ====== Steps (with collapse) ====== */}
              <td data-label={t("recruiter.shared.table.steps") || "Steps"}>
                <div style={{display:"flex", flexDirection:"column"}}>
                  <div
                    className={`steps-wrapper ${expandedRows[prog._id] ? "expanded" : ""}`}
                  >
                    {prog.steps?.length ? (
                      <ul className="shared-steps">
                        {prog.steps.map((step) => (
                          <li key={step.step} className="shared-step-item">
                            <p className="step-name">
                              <b>Step {step.step}:</b> {step.name}
                            </p>
                            <div className="steps-footer">
                              <span className={`step-status ${step.status}`}>
                                {step.status.replace("_", " ")}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <i>{t("recruiter.shared.not_initialized") || "Not initialized"}</i>
                    )}
                  </div>

                  {/* Nút toggle xem thêm / thu gọn */}
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

              <td data-label="Actions">
                <select
                  disabled={actionLoading === prog._id}
                  defaultValue=""
                  onChange={(e) => handleActionChange(prog._id, e)}
                >
                  <option value="" disabled>
                    {t("recruiter.shared.table.select_placeholder") || "-- Select --"}
                  </option>
                  <option value="get_link">{t("recruiter.shared.table.getlink")}</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
