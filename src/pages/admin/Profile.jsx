import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaEdit, FaSave, FaTimes, FaCreditCard, FaUser } from "react-icons/fa";
import "./Profile.css";
import { useI18n } from "../../i18n";
import { updateBasicInfo, getMyProfile } from "../../api";

export default function ViewProfile() {
  const { user, setUser, updateSession } = useAuth();
  const { t } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
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
    registeredEmail: "",
    registeredPhone: "",
  });

  // 🧩 Khi load component -> gọi API lấy thông tin thật
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
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
  }, [setUser]);

  // 🧠 Xử lý thay đổi input
  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };


  // 💾 Lưu thông tin
  const handleBasicInfoSave = async () => {
    try {
      const payload = {
        ...basicInfo,
        bankInfo,
      };
      delete payload.newPassword;
      if (basicInfo.newPassword) payload.password = basicInfo.newPassword;


      const res = await updateBasicInfo(payload);

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
    <div className="profile-container">
      <div className="profile-header">
        <h2>{t("admin.profile.title")}</h2>
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

      <div className="profile-content">
        {/* Thông tin cơ bản */}
        <div className="info-section">
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

       
      </div>
    </div>
  );
}
