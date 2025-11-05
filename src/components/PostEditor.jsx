import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { upFileToStorage, getProgrammsList } from "../api";
import "./PostEditor.css";

/* =========================================================
   📦 COMPONENT: PostCard - Hiển thị xem trước bài viết
========================================================= */
const PostCard = ({ title, thumbnail, fileType, content, type, location, eventDate }) => (
  <div className="post-card">
    {thumbnail && (
      <div className="post-card-media">
        {fileType === "image" ? (
          <img src={thumbnail} alt={title} />
        ) : (
          <video src={thumbnail} controls />
        )}
      </div>
    )}

    <h2 className="post-card-title">{title}</h2>

    {type === "upcoming_event" && (
      <p className="post-card-event">
        📍 {location} — 📅 {eventDate}
      </p>
    )}

    {content && (
      <div
        className="post-card-content ql-editor"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )}
  </div>
);

/* =========================================================
   📤 COMPONENT: FileUpload - Upload ảnh hoặc video
========================================================= */
const FileUpload = ({ onFileChange, uploading, thumbnail, fileType }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      alert("❌ Chỉ hỗ trợ file ảnh hoặc video!");
      return;
    }

    onFileChange(file, isVideo ? "video" : "image");
  };

  return (
    <div className="thumbnail-upload">
      <label>Ảnh hoặc Video:</label>
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {uploading && <p className="uploading-text">Đang tải lên...</p>}

      {thumbnail && (
        <div className="preview-container">
          {fileType === "image" ? (
            <img src={thumbnail} alt="Preview" className="preview-img" />
          ) : (
            <video src={thumbnail} controls className="preview-video" />
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   📚 COMPONENT: ProgramSelect - Dropdown chọn chương trình
========================================================= */
const ProgramSelect = ({ programms, selectedProgram, onChange }) => (
  <div className="program-search">
    <label>Chọn chương trình:</label>
    <select value={selectedProgram} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Chọn chương trình --</option>
      {programms.map((p) => (
        <option key={p._id} value={p._id}>
          {p.title}
        </option>
      ))}
    </select>
  </div>
);

/* =========================================================
   🧩 COMPONENT CHÍNH: PostEditor
========================================================= */
export default function PostEditor({ onSave }) {
  const [form, setForm] = useState({
    type: "success_story",
    title: "",
    thumbnail: "",
    fileType: "",
    content: "",
    location: "",
    eventDate: "",
    selectedProgram: "",
  });
  const [uploading, setUploading] = useState(false);
  const [programms, setProgramms] = useState([]);

  /* --- Load danh sách chương trình --- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getProgrammsList();
        setProgramms(res.data);
      } catch (err) {
        console.warn("⚠️ Lỗi tải chương trình:", err);
      }
    })();
  }, []);

  /* --- Upload file --- */
  const handleFileChange = useCallback(async (file, type) => {
    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setForm((prev) => ({ ...prev, thumbnail: url, fileType: type }));
      alert("✅ Upload thành công!");
    } catch {
      alert("❌ Upload thất bại!");
    } finally {
      setUploading(false);
    }
  }, []);

  /* --- Cập nhật trường form --- */
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* --- Reset form --- */
  const resetForm = () => {
    setForm({
      type: "success_story",
      title: "",
      thumbnail: "",
      fileType: "",
      content: "",
      location: "",
      eventDate: "",
      selectedProgram: "",
    });
  };

  /* --- Submit --- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const { type, title, thumbnail, selectedProgram, fileType, content, location, eventDate } = form;

    if (!title || !thumbnail || !selectedProgram) {
      alert("⚠️ Vui lòng nhập đủ thông tin và tải file!");
      return;
    }

    const postData = {
      type,
      title,
      thumbnail_url: thumbnail,
      file_type: fileType,
      content: type !== "upcoming_event" ? content : "",
      location: type === "upcoming_event" ? location : undefined,
      eventDate: type === "upcoming_event" ? eventDate : undefined,
      progId: selectedProgram,
    };

    onSave?.(postData);
    alert("✅ Bài viết đã được đăng!");
    resetForm();
  };

  return (
    <div className="add-container">
      {/* ==== BÊN TRÁI: Form soạn bài ==== */}
      <form className="post-add" onSubmit={handleSubmit}>
        <h2 className="post-add-title">📝 Tạo Bài Viết</h2>

        <select value={form.type} onChange={(e) => updateField("type", e.target.value)}>
          <option value="success_story">Success Story</option>
          <option value="career_tip">Career Tip</option>
          <option value="upcoming_event">Upcoming Event</option>
        </select>

        <input
          type="text"
          placeholder="Tiêu đề bài viết"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <FileUpload
          onFileChange={handleFileChange}
          uploading={uploading}
          thumbnail={form.thumbnail}
          fileType={form.fileType}
        />

        <ProgramSelect
          programms={programms}
          selectedProgram={form.selectedProgram}
          onChange={(value) => updateField("selectedProgram", value)}
        />

        {["success_story", "career_tip"].includes(form.type) && (
          <ReactQuill
            className="post-editor-quill"
            theme="snow"
            value={form.content}
            onChange={(value) => updateField("content", value)}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }, { header: "3" }, { font: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["bold", "italic", "underline"],
                [{ align: [] }],
                ["link", "image"],
              ],
            }}
          />
        )}

        {form.type === "upcoming_event" && (
          <>
            <input
              type="text"
              placeholder="Địa điểm tổ chức"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => updateField("eventDate", e.target.value)}
            />
          </>
        )}

        <div className="editor-actions">
          <button type="submit" disabled={uploading}>
            {uploading ? "Đang tải lên..." : "Đăng bài"}
          </button>
        </div>
      </form>

      {/* ==== BÊN PHẢI: Xem trước ==== */}
      <div className="post-preview">
        <h3>👁️ Xem trước</h3>
        <PostCard
          title={form.title}
          thumbnail={form.thumbnail}
          fileType={form.fileType}
          content={form.content}
          type={form.type}
          location={form.location}
          eventDate={form.eventDate}
        />
      </div>
    </div>
  );
}
