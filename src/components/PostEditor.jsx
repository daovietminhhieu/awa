import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { upFileToStorage, getProgrammsList, createPost } from "../api";
import "./PostEditor.css";
import { useI18n } from "../i18n";
import TranslatableText from "../TranslateableText";

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
const FileUpload = ({ onFileChange, uploading, thumbnail, fileType, t, lang}) => {
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
      <label><TranslatableText text={t('admin.post.add_form.media_select')} lang={lang}/></label>
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {uploading && <p className="uploading-text"><TranslatableText text={t('admin.post.uploading')} lang={lang}/></p>}

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
const ProgramSelect = ({ programms, selectedProgram, onChange, t, lang }) => (
  <div className="program-search">
    <label><TranslatableText text={t('admin.post.add_form.relevant_programms')} lang={lang}/></label>
    <select value={selectedProgram} onChange={(e) => onChange(e.target.value)}>
      <option value=""><TranslatableText text={t('admin.post.add_form.programms_select')} lang={lang}/></option>
      {programms.map((p) => (
        <option key={p._id} value={p._id}>
          <TranslatableText text={p.title} lang={lang}/>
        </option>
      ))}
    </select>
  </div>
);

/* =========================================================
   🧩 COMPONENT CHÍNH: PostEditor
========================================================= */
export default function PostEditor({ onSave }) {
  const {t, lang} = useI18n();
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
  const handleSubmit = async (e) => {
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
      content: content,
      progId: selectedProgram,
      eventDate: type === "upcoming_event"
        ? {
            date: form.eventDate || "",
            startTime: form.startTime || "",
            endTime: form.endTime || "",
          }
        : undefined,
      location: type === "upcoming_event" ? location : undefined,
    };
    
    console.log(postData);
    try {
      const result = await createPost(postData); // gọi đúng hàm
      alert("✅ Bài viết đã được đăng!");
      resetForm();
      console.log("Post created:", result.data);
    } catch (err) {
      alert("❌ Lỗi khi tạo bài viết: " + err.message);
    }
  };
  

  return (
    <div className="add-container">
      {/* ==== BÊN TRÁI: Form soạn bài ==== */}
      <form className="post-add" onSubmit={handleSubmit}>
        <h2 className="post-add-title"><TranslatableText text={t('admin.post.add_form.title')} lang={lang}/></h2>

        <select value={form.type} onChange={(e) => updateField("type", e.target.value)}>
          <option value="success_story"><TranslatableText text={t('admin.post.add_form.category.success_story')} lang={lang}/></option>
          <option value="career_tip"><TranslatableText text={t('admin.post.add_form.category.career_tip')} lang={lang}/></option>
          <option value="upcoming_event"><TranslatableText text={t('admin.post.add_form.category.upcoming_event')} lang={lang}/></option>
        </select>

        <input
          type="text"
          placeholder={t('admin.post.add_form.enter_title')}
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <FileUpload
          onFileChange={handleFileChange}
          uploading={uploading}
          thumbnail={form.thumbnail}
          fileType={form.fileType}
          t={t} lang={lang}
        />

        <ProgramSelect
          programms={programms}
          selectedProgram={form.selectedProgram}
          onChange={(value) => updateField("selectedProgram", value)}
          t={t} lang={lang}
        />

        {["success_story", "career_tip", "upcoming_event"].includes(form.type) && (
          <ReactQuill
            className="post-editor-quill"
            theme="snow"
            value={form.content}
            onChange={(value) => updateField("content", value)}
            modules={{
              toolbar: {
                container: [
                  [{ header: "1" }, { header: "2" }, { header: "3" }, { font: [] }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["bold", "italic", "underline"],
                  [{ align: [] }],
                  ["link", "image", "video"],
                ],
                handlers: {
                  video: async function () {
                    const choice = window.prompt(
                      "🎥 Dán link YouTube hoặc bấm Cancel để tải video từ máy:"
                    );
          
                    const range = this.quill.getSelection(true);
          
                    if (choice && choice.startsWith("http")) {
                      // ✅ Nhúng YouTube
                      const youtubeMatch = choice.match(
                        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
                      );
                      if (youtubeMatch) {
                        const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                        this.quill.insertEmbed(range.index, "video", embedUrl);
                      } else {
                        alert("⚠️ Link không hợp lệ. Hãy nhập đúng link YouTube!");
                      }
                      return;
                    }
          
                    // 🟢 Nếu không nhập link → upload từ máy
                    const fileInput = document.createElement("input");
                    fileInput.setAttribute("type", "file");
                    fileInput.setAttribute("accept", "video/*");
                    fileInput.click();
          
                    fileInput.onchange = async () => {
                      const file = fileInput.files[0];
                      if (!file) return;
          
                      this.quill.insertText(range.index, "⏳ Đang tải video...", "italic", true);
                      try {
                        const url = await upFileToStorage(file);
                        this.quill.deleteText(range.index, "⏳ Đang tải video...".length);
                        this.quill.insertEmbed(range.index, "video", url);
                        alert("✅ Video đã tải lên thành công!");
                      } catch (err) {
                        console.error(err);
                        alert("❌ Lỗi tải video!");
                        this.quill.deleteText(range.index, "⏳ Đang tải video...".length);
                      }
                    };
                  },
                 
                },
              },
            }}
            formats={[
              "header",
              "font",
              "list",
              "bullet",
              "bold",
              "italic",
              "underline",
              "align",
              "link",
              "image",
              "video",
            ]}
          />
        
        )}

        {form.type === "upcoming_event" && (
          <div className="event-info">
            <input
              type="text"
              placeholder={t('admin.post.add_form.enter_location')}
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />

            <div className="event-time-group">
              <label>🕓 {t('admin.post.add_form.event_time') || "Thời gian"}:</label>
              <div className="time-inputs">
                <input
                  type="time"
                  value={form.startTime || ""}
                  onChange={(e) => updateField("startTime", e.target.value)}
                />
                <span>–</span>
                <input
                  type="time"
                  value={form.endTime || ""}
                  onChange={(e) => updateField("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="event-date-group">
              <label>📅 {t('admin.post.add_form.event_date') || "Ngày diễn ra"}:</label>
              <input
                type="date"
                value={form.eventDate || ""}
                onChange={(e) => updateField("eventDate", e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="editor-actions">
          <button type="submit" disabled={uploading}>
            {uploading ?  <>{<TranslatableText text={t('admin.post.add_form.uploading')} lang={lang}/>} </>
                                : 
                          <>{<TranslatableText text={t('admin.post.add_form.posting')} lang={lang}/>} </>}
          </button>
        </div>
      </form>

      {/* ==== BÊN PHẢI: Xem trước ==== */}
      <div className="post-preview">
        <h3><TranslatableText text={t('admin.post.add_form.preview')} lang={lang}/></h3>
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