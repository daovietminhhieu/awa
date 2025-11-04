import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { upFileToStorage, getProgrammsList } from "../api";
import "./PostEditor.css";

// ================= Reusable PostCard =================
const PostCard = ({ title, thumbnail, fileType, content, type, location, eventDate }) => {
  return (
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
};

// ================= FileUpload =================
const FileUpload = ({ onFileChange, uploading, thumbnail, fileType }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
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
        onChange={handleFileChange}
        ref={fileInputRef}
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

// ================= ProgramSelect =================
const ProgramSelect = ({ programms, selectedProgram, onProgramSelect }) => (
  <div className="program-search">
    <label>Chọn chương trình:</label>
    <select value={selectedProgram} onChange={(e) => onProgramSelect(e.target.value)}>
      <option value="">-- Chọn chương trình --</option>
      {programms.map((p) => (
        <option key={p._id} value={p._id}>
          {p.title}
        </option>
      ))}
    </select>
  </div>
);

// ================= Main PostEditor =================
export default function PostEditor({ onSave }) {
  const [type, setType] = useState("success_story");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [programms, setProgramms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const res = await getProgrammsList();
        setProgramms(res.data);
      } catch (err) {
        console.warn("⚠️ Lỗi tải chương trình:", err);
      }
    };
    loadPrograms();
  }, []);

  // === Upload handler ===
  const handleFileChange = async (file, type) => {
    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setThumbnail(url);
      setFileType(type);
      alert("✅ Upload thành công!");
    } catch {
      alert("❌ Upload thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // === Reset form ===
  const resetForm = () => {
    setType("success_story");
    setTitle("");
    setThumbnail("");
    setFileType("");
    setContent("");
    setLocation("");
    setEventDate("");
    setSelectedProgram("");
  };

  // === Submit form ===
  const handleSubmit = (e) => {
    e.preventDefault();

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

    if (onSave) onSave(postData);

    alert("✅ Bài viết đã được đăng!");
    resetForm();
  };

  return (
    <div className="editor-container">
      {/* ==== BÊN TRÁI: Soạn thảo ==== */}
      <form className="post-editor" onSubmit={handleSubmit}>
        <h2 className="post-editor-title">📝 Tạo Bài Viết</h2>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="success_story">Success Story</option>
          <option value="career_tip">Career Tip</option>
          <option value="upcoming_event">Upcoming Event</option>
        </select>

        <input
          type="text"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <FileUpload
          onFileChange={handleFileChange}
          uploading={uploading}
          thumbnail={thumbnail}
          fileType={fileType}
        />

        <ProgramSelect
          programms={programms}
          selectedProgram={selectedProgram}
          onProgramSelect={setSelectedProgram}
        />

        {(type === "success_story" || type === "career_tip") && (
          <ReactQuill
            className="post-editor-quill"
            theme="snow"
            value={content}
            onChange={setContent}
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

        {type === "upcoming_event" && (
          <>
            <input
              type="text"
              placeholder="Địa điểm tổ chức"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
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
          title={title}
          thumbnail={thumbnail}
          fileType={fileType}
          content={content}
          type={type}
          location={location}
          eventDate={eventDate}
        />
      </div>
    </div>
  );
}
