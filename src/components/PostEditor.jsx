import React, { useState, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./PostEditor.css";
import { upFileToStorage } from "../api";

export default function PostEditor({ onSave }) {
  const [type, setType] = useState("success_story");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [fileType, setFileType] = useState(""); // 🆕 ảnh hoặc video
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");

  const fileInputRef = useRef(null);

  // 🟩 Khi chọn file (ảnh hoặc video)
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

      setThumbnail(result);
      setFileType(isVideo ? "video" : "image");
      setFile(selectedFile);
      console.log("📦 Upload result:", result);
    } catch (err) {
      alert("Upload thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 🟩 Gửi bài
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !thumbnail) {
      alert("Vui lòng nhập tiêu đề và tải file bìa (ảnh hoặc video)!");
      return;
    }

    if ((type === "success_story" || type === "career_tip") && !content) {
      alert("Nội dung không được để trống!");
      return;
    }

    if (type === "upcoming_event" && (!location || !eventDate)) {
      alert("Cần nhập địa điểm và ngày tổ chức!");
      return;
    }

    const postData = {
      type,
      title,
      thumbnail_url: thumbnail,
      file_type: fileType, // 🆕 thêm loại file
      content: type !== "upcoming_event" ? content : "",
      location: type === "upcoming_event" ? location : undefined,
      eventDate: type === "upcoming_event" ? eventDate : undefined,
    };

    if (onSave) onSave(postData);

    // Reset form
    setTitle("");
    setThumbnail("");
    setFile(null);
    setFileType("");
    setContent("");
    setLocation("");
    setEventDate("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form className="post-editor" onSubmit={handleSubmit}>
      <h2 className="post-editor-title">📝 New Post</h2>

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="success_story">Success Story</option>
        <option value="career_tip">Career Tip</option>
        <option value="upcoming_event">Upcoming Event</option>
      </select>

      <input
        className="post-title-input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Upload ảnh hoặc video */}
      <div className="thumbnail-upload">
        <label>Thumbnail / Video:</label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {uploading && <p>Đang tải file lên...</p>}

        {thumbnail && (
          <div style={{ marginTop: "8px" }}>
            {fileType === "image" ? (
              <img
                src={thumbnail}
                alt="Preview"
                style={{
                  width: "220px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <video
                src={thumbnail}
                controls
                style={{
                  width: "240px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              />
            )}
          </div>
        )}
      </div>

      {(type === "success_story" || type === "career_tip") && (
        <ReactQuill
          className="post-editor-quill"
          value={content}
          onChange={setContent}
        />
      )}

      {type === "upcoming_event" && (
        <>
          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </>
      )}

      <div className="editor-actions">
        <button type="submit" disabled={uploading}>
          {uploading ? "Đang tải file..." : "Đăng bài"}
        </button>
      </div>
    </form>
  );
}
