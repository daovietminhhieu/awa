import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaEdit, FaSave, FaTimes, FaCreditCard, FaUser } from "react-icons/fa";
import "./Profile.css";
import { useI18n } from "../../i18n";
import { updateBasicInfo, getMyProfile } from "../../api";
import Footer from "../../components/footer/Footer";

export default function ViewProfile() {
  const { user, setUser, updateSession } = useAuth();
  const { t } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    role: "",
    newPassword: "",
  });
  const [bankInfo, setBankInfo] = useState({
    accountHolderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
    ibanSwiftCode: "",
    currency: "VNĐ",
    // registeredEmail: "",
    // registeredPhone: "",
  });

  // 🧩 Khi load component -> gọi API lấy thông tin thật
  useEffect(() => {
    if (!user?._id) return;

    const fetchProfile = async () => {
      console.log(user);
      try {
        const res = await getMyProfile(user._id);
        if (res.success) {
          setBasicInfo({
            name: res.data.name || "",
            email: res.data.email || "",
            role: res.data.role || "",
            newPassword: "",
          });
          if (res.data.bankInfo) setBankInfo(res.data.bankInfo);
          setUser(res.data);
        } else {
          console.error("❌ Failed to load profile:", res.message);
        }
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      }
    };

    fetchProfile();
  }, [user?._id]);

  // 🧠 Xử lý thay đổi input
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankInfoChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Lưu thông tin cơ bản và ngân hàng
  const handleBasicInfoSave = async () => {
    try {
      const payload = {
        ...basicInfo,
        bankInfo,
      };
      delete payload.newPassword;
      if (basicInfo.newPassword) payload.password = basicInfo.newPassword;

      console.log(payload);
      const res = await updateBasicInfo(user._id, payload);
      console.log(res);
      if (res.success) {
        const updatedUser = res.data.user;
        updateSession(updatedUser, res.data.token);
        setUser(updatedUser);
        alert("✅ Profile updated successfully!");
        setIsEditing(false);
      } else {
        alert(res.message || "Update failed");
      }
    } catch (err) {
      console.error("❌ Error updating basic information:", err);
      alert("Update failed");
    }
  };

  if (!user) return null;

  return (
    <div className="pf-page">
      <div className="profile-container">
        <div className="profile-header">
          <h2>{t("admin.profile.title")}</h2>
          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                <FaEdit /> {t("admin.profile.edit_profile")}
              </button>
            ) : (
              <div className="edit-actions">
                <button onClick={handleBasicInfoSave} className="btn-save">
                  <FaSave /> {t("admin.profile.save_changes")}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-cancel">
                  <FaTimes /> {t("admin.profile.cancel")}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pf-header">
          <div className="pf-tabs">
            <button
              className={`pf-tab ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              {t("admin.profile.info")}
            </button>
            <button
              className={`pf-tab ${activeTab === "bank" ? "active" : ""}`}
              onClick={() => setActiveTab("bank")}
            >
              {t("admin.profile.bank") || "Bank Info"}
            </button>
          </div>
        </div>

        <div className="profile-content">
          {/* Thông tin cơ bản */}
          {activeTab === "basic" && (
            <div className="info-section pf-card">
              <h3>
                <FaUser className="section-icon" /> {t("admin.profile.info")}
              </h3>

              {isEditing ? (
                <div className="info-grid">
                  <div className="info-item">
                    <label htmlFor="name">{t("admin.profile.setname")}</label>
                    <input
                      id="name"
                      name="name"
                      value={basicInfo.name}
                      onChange={handleBasicInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="email">{t("admin.profile.setemail")}</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={basicInfo.email}
                      onChange={handleBasicInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="newPassword">{t("admin.profile.setnewpassword")}</label>
                    <input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      value={basicInfo.newPassword}
                      onChange={handleBasicInfoChange}
                      className="pf-input"
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
                    <span>{basicInfo.role}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Thông tin ngân hàng */}
          {activeTab === "bank" && (
            <div className="info-section pf-card">
              <h3>
                <FaCreditCard className="section-icon" /> {t("admin.profile.bank") || "Bank Info"}
              </h3>
              {isEditing ? (
                <div className="info-grid">
                  <div className="info-item">
                    <label htmlFor="accountHolderName">Account Holder</label>
                    <input
                      id="accountHolderName"
                      name="accountHolderName"
                      value={bankInfo.accountHolderName}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="bankName">Bank Name</label>
                    <input
                      id="bankName"
                      name="bankName"
                      value={bankInfo.bankName}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="branchName">Branch</label>
                    <input
                      id="branchName"
                      name="branchName"
                      value={bankInfo.branchName}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="accountNumber">Account Number</label>
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      value={bankInfo.accountNumber}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="ibanSwiftCode">IBAN/SWIFT</label>
                    <input
                      id="ibanSwiftCode"
                      name="ibanSwiftCode"
                      value={bankInfo.ibanSwiftCode}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="currency">Currency</label>
                    <input
                      id="currency"
                      name="currency"
                      value={bankInfo.currency}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  {/* <div className="info-item">
                    <label htmlFor="registeredEmail">Registered Email</label>
                    <input
                      id="registeredEmail"
                      name="registeredEmail"
                      value={bankInfo.registeredEmail}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div>
                  <div className="info-item">
                    <label htmlFor="registeredPhone">Registered Phone</label>
                    <input
                      id="registeredPhone"
                      name="registeredPhone"
                      value={bankInfo.registeredPhone}
                      onChange={handleBankInfoChange}
                      className="pf-input"
                    />
                  </div> */}
                </div>
              ) : (
                <div className="info-grid">
                  <div className="info-item">
                    <label>Account Holder</label>
                    <span>{bankInfo.accountHolderName || "-"}</span>
                  </div>
                  <div className="info-item">
                    <label>Bank Name</label>
                    <span>{bankInfo.bankName || "-"}</span>
                  </div>
                  <div className="info-item">
                    <label>Branch</label>
                    <span>{bankInfo.branchName || "-"}</span>
                  </div>
                  <div className="info-item">
                    <label>Account Number</label>
                    <span>{bankInfo.accountNumber || "-"}</span>
                  </div>
                  <div className="info-item">
                    <label>IBAN/SWIFT</label>
                    <span>{bankInfo.ibanSwiftCode || "-"}</span>
                  </div>
                  <div className="info-item">
                    <label>Currency</label>
                    <span>{bankInfo.currency || "-"}</span>
                  </div>
                  {/* <div className="info-item">
                    <label>Registered Email</label>
                    <span>{bankInfo.registeredEmail || "-"}</span>
                  </div>
                  <div className="info-item">
                    <label>Registered Phone</label>
                    <span>{bankInfo.registeredPhone || "-"}</span>
                  </div> */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
