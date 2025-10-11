import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaCreditCard,
  FaUser,
} from "react-icons/fa";
import "./Profile.css";
import { useI18n } from "../../i18n";

export default function ViewProfile() {
  const { user, setUser } = useAuth();
  const { t } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    accountHolderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    ibanSwiftCode: "",
    currency: "VNĐ",
    registeredEmail: "",
    registeredPhone: "",
  });
  const [basicInfo, setBasicInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    password: user?.password || "",
    newPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBasicInfoSave = async () => {
    try {
      // Gửi lên server / API
      alert(t("admin.profile.alert_updated_success") || "Basic information updated!");

      const updatedProfile = {
        name: basicInfo.name,
        email: basicInfo.email,
        role: basicInfo.role,
        password: basicInfo.password,
      };

      setBasicInfo({
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        password: updatedProfile.password,
        newPassword: "",
      });

      setUser(updatedProfile);
    } catch (error) {
      console.error("Error updating basic information:", error);
      alert(t("admin.profile.alert_update_error") || "An error occurred while updating.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{t("admin.profile.title")}</h2>
        <div className="profile-actions">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-edit"
              title={t("admin.profile.edit_profile")}
            >
              <FaEdit /> {t("admin.profile.edit_profile")}
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleBasicInfoSave} className="btn-save">
                <FaSave /> {t("admin.profile.save_changes")}
              </button>
              <button onClick={handleCancel} className="btn-cancel">
                <FaTimes /> {t("admin.profile.cancel")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="info-section">
          <h3>
            <FaUser className="section-icon" /> {t("admin.profile.info")}
          </h3>
          {isEditing ? (
            <div className="info-grid">
              <div className="info-item">
                <label htmlFor="name">{t("admin.profile.setname")}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={basicInfo.name}
                  onChange={handleBasicInfoChange}
                />
              </div>
              <div className="info-item">
                <label htmlFor="email">{t("admin.profile.setemail")}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={basicInfo.email}
                  onChange={handleBasicInfoChange}
                />
              </div>
              <div className="info-item">
                <label htmlFor="role">{t("admin.profile.role")}</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={basicInfo.role}
                  disabled
                />
              </div>
              <div className="info-item">
                <label htmlFor="newPassword">{t("admin.profile.setnewpassword")}</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={basicInfo.newPassword}
                  onChange={handleBasicInfoChange}
                  placeholder={t("admin.profile.place_newpassword")}
                />
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>{t("admin.profile.name")}</label>
                <span>{basicInfo.name || "-"}</span>
              </div>
              <div className="info-item">
                <label>{t("admin.profile.email")}</label>
                <span>{basicInfo.email || "-"}</span>
              </div>
              <div className="info-item">
                <label>{t("admin.profile.role")}</label>
                <span className={`role-badge ${basicInfo.role}`}>{basicInfo.role}</span>
              </div>
              <div className="info-item">
                <label>{t("admin.profile.password")}</label>
                <span>{"••••••••"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bank Account Information, nếu role = recruiter */}
        {user.role === "recruiter" && (
          <div className="info-section">
            <h3>
              <FaCreditCard className="section-icon" />{" "}
              {t("recruiter.profile.bank_info_title")}
            </h3>
            {isEditing ? (
              <div className="bank-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="accountHolderName">
                      {t("recruiter.profile.setname")} *
                    </label>
                    <input
                      type="text"
                      id="accountHolderName"
                      name="accountHolderName"
                      value={bankInfo.accountHolderName}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_accountHolderName")}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bankName">{t("recruiter.profile.setbank")} *</label>
                    <input
                      type="text"
                      id="bankName"
                      name="bankName"
                      value={bankInfo.bankName}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_bankName")}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="branchName">{t("recruiter.profile.setbranch")}</label>
                    <input
                      type="text"
                      id="branchName"
                      name="branchName"
                      value={bankInfo.branchName}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_branchName")}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="accountNumber">{t("recruiter.profile.accountNumber")} *</label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={bankInfo.accountNumber}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_accountNumber")}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ibanSwiftCode">{t("recruiter.profile.ibanSwiftCode")}</label>
                    <input
                      type="text"
                      id="ibanSwiftCode"
                      name="ibanSwiftCode"
                      value={bankInfo.ibanSwiftCode}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_ibanSwiftCode")}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="currency">{t("recruiter.profile.currency")} *</label>
                    <select
                      id="currency"
                      name="currency"
                      value={bankInfo.currency}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="VNĐ">
                        {t("recruiter.profile.currency_vnd")}
                      </option>
                      <option value="USD">
                        {t("recruiter.profile.currency_usd")}
                      </option>
                      <option value="EUR">
                        {t("recruiter.profile.currency_eur")}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="registeredEmail">{t("recruiter.profile.registeredEmail")} *</label>
                    <input
                      type="email"
                      id="registeredEmail"
                      name="registeredEmail"
                      value={bankInfo.registeredEmail}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_registeredEmail")}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="registeredPhone">{t("recruiter.profile.registeredPhone")} *</label>
                    <input
                      type="tel"
                      id="registeredPhone"
                      name="registeredPhone"
                      value={bankInfo.registeredPhone}
                      onChange={handleInputChange}
                      placeholder={t("recruiter.profile.placeholder_registeredPhone")}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bank-info-display">
                <div className="info-grid">
                  <div className="info-item">
                    <label>{t("recruiter.profile.accountHolderName")}</label>
                    <span>{bankInfo.accountHolderName || t("common.not_provided")}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.bankName")}</label>
                    <span>{bankInfo.bankName || t("common.not_provided")}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.branchName")}</label>
                    <span>{bankInfo.branchName || t("common.not_provided")}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.accountNumber")}</label>
                    <span>{bankInfo.accountNumber || t("common.not_provided")}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.ibanSwiftCode")}</label>
                    <span>{bankInfo.ibanSwiftCode || t("common.not_provided")}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.currency")}</label>
                    <span>{bankInfo.currency}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.registeredEmail")}</label>
                    <span>{bankInfo.registeredEmail || t("common.not_provided")}</span>
                  </div>
                  <div className="info-item">
                    <label>{t("recruiter.profile.registeredPhone")}</label>
                    <span>{bankInfo.registeredPhone || t("common.not_provided")}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="commitment-section">
              <div className="commitment-box">
                <h4>{t("recruiter.profile.commitment_title")}</h4>
                <p>{t("recruiter.profile.commitment_text")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
