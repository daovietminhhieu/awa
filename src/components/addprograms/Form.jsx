import React, {useState, useRef} from "react";
import './Form.css';
import { useI18n } from "../../i18n";
import { upFileToStorage } from "../../api";
import TranslatableText from "../../i18n/TranslateableText";

/* =========================================================
   🟢 ADD PROGRAM FORM
   ========================================================= */
   export default function AddProgramForm({ onSubmit, onClose, defaultValues }) {
    const { t,lang } = useI18n();
    const [formData, setFormData] = useState(defaultValues);
    const [uploading, setUploading] = useState(false);
    const [fileType, setFileType] = useState(""); // image | video
    const fileInputRef = useRef(null);
  
    // Xử lý thay đổi input
    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name.includes(".")) {
        const [section, field] = name.split(".");
        setFormData((prev) => ({
          ...prev,
          [section]: { ...prev[section], [field]: value },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    };
  
    // Upload file lên Supabase
    const handleFileChange = async (e) => {
      const selectedFile = e.target.files[0];
      if (!selectedFile) return;
  
      const isVideo = selectedFile.type.startsWith("video/");
      const isImage = selectedFile.type.startsWith("image/");
      if (!isVideo && !isImage) {
        alert("Vui lòng chọn file ảnh hoặc video hợp lệ!");
        return;
      }
  
      setUploading(true);
      try {
        const result = await upFileToStorage(selectedFile);
        if (!result) throw new Error("Upload failed: no URL returned");
  
        setFileType(isVideo ? "video" : "image");
        setFormData((prev) => ({ ...prev, logoL: result }));
  
        console.log("📦 File uploaded to Supabase:", result);
      } catch (err) {
        alert("Upload thất bại: " + err.message);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
  
    // Submit form
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.logoL) {
        alert("Vui lòng tải lên logo hoặc video trước khi tạo chương trình!");
        return;
      }
      await onSubmit(formData);
      onClose();
    };
  
    return (
      <div className="edit-modal">
        <div className="edit-form">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h2>{t("admin.programms.edit.add_title") || "Add New Program"}</h2>
  
          <form onSubmit={handleSubmit}>
            <h3>{t("admin.programms.edit.basic_info") || "Basic Info"}</h3>
  
            {["title", "company", "type", "degrees", "duration", "land"].map(
              (field) => (
                <label key={field}>
                  {t(`admin.programms.edit.new.${field}`)}:
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required={field === "title"}
                    placeholder={t(`admin.programms.edit.new.enter_${field}`)}
                  />
                </label>
              )
            )}
  
            {/* Upload ảnh/video */}
            <label>
              {t("admin.programms.edit.new.logoL") || "Logo / Media:"}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {uploading && (
                <p className="text-sm text-blue-600 mt-1">
                  ⏳ {t("common.uploading") || "Đang tải file lên..."}
                </p>
              )}
              {formData.logoL && (
                <div style={{ marginTop: "8px" }}>
                  {fileType === "image" ? (
                    <img
                      src={formData.logoL}
                      alt="Preview"
                      style={{
                        width: "200px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    />
                  ) : (
                    <video
                      src={formData.logoL}
                      controls
                      style={{
                        width: "220px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      }}
                    />
                  )}
                </div>
              )}
            </label>
  
            {/* Thông tin thêm */}
            <label>
              <TranslatableText text={t('admin.programms.edit.new.overview')} lang={lang}/>
              <textarea
                name="details.overview"
                value={formData.details.overview}
                onChange={handleChange}
                placeholder={t('admin.programms.edit.new.enter_details_overview')}
              />
            </label>

            <label>
            <TranslatableText text={t('admin.programms.edit.new.requirement')} lang={lang}/>
              <textarea
                name="requirement.education"
                value={formData.requirement.education}
                onChange={handleChange}
                placeholder={t('admin.programms.edit.new.enter_details_requirement')}
              />
            </label>

            <label>
              {t("admin.programms.edit.new.benefit") || "Benefits"}:
              <textarea
                name="details.benefit"
                value={formData.details?.benefit || ""}
                onChange={handleChange}
                placeholder={t("admin.programms.edit.new.enter_details_benefit") || "Enter benefits..."}
                style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
              />
            </label>
  
            {/* Buttons */}
            <div className="form-buttons">
              <button type="submit" disabled={uploading}>
                {uploading
                  ? "Đang tải file..."
                  : `✅ ${t("admin.programms.edit.create") || "Create"}`}
              </button>
              <button type="button" onClick={onClose}>
                {t("admin.programms.edit.cancel") || "Cancel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
