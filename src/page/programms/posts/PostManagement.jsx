// ⚡️ src/pages/admin/programms/PostManagement.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
} from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  getPostsListL,
  createPostL,
  updatePostL,
  removePostL,
  getProgramsList,
  upFileToStorage,
} from "../../../api";

import TranslatableText from "../../../i18n/TranslateableText";
import { useI18n } from "../../../i18n";
import { useNavigate } from "react-router-dom";
import "./PostManagement.css";

/* =========================================================
   HELPERS
   ========================================================= */
const normalizeArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const stripHTML = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
export default function PostManagement() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // null = list | {} = add | post = edit
  const [formPost, setFormPost] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPostsListL();
      setPosts(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("❌ Load posts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDeletePost = async (id) => {
    if (!window.confirm(t("admin.post.confirm_delete") || "Are you sure you want to delete this post?")) return;
    try {
      await removePostL(id);
      alert("✅ " + (t("admin.post.deleted") || "Post deleted"));
      loadPosts();
    } catch (err) {
      alert("❌ " + (t("admin.post.delete_error") || "Error deleting post"));
    }
  };

  return (
    <div className="post-management-section">
      {/* TOOLBAR */}
      <div className="post-toolbar">
        <button
          className={`toggle-btn ${formPost ? "active" : ""}`}
          onClick={() => setFormPost(formPost ? null : {})}
        >
          {formPost
            ? t("admin.post.show_post_list")
            : t("admin.post.create_post")}
        </button>
      </div>

      {/* FORM (ADD / EDIT) */}
      {formPost && (
        <PostForm
          post={formPost.id ? formPost : null}
          onClose={() => setFormPost(null)}
          onSaved={() => {
            loadPosts();
            setFormPost(null);
          }}
        />
      )}

      {/* LIST */}
      {!formPost && (
        <div className="post-list-container">
          <h3 style={{ marginBottom: 40 }}>
            <TranslatableText text={t("admin.post.title")} lang={lang} />
          </h3>

          {loading ? (
            <p>{t("admin.post.loading")}</p>
          ) : posts.length === 0 ? (
            <p>{t("admin.post.emptylist")}</p>
          ) : (
            <div className="post-list">
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onEdit={() => setFormPost(p)}
                  onDelete={() => handleDeletePost(p.id)}
                  navigate={navigate}
                  t={t}
                  lang={lang}
                  excerpt={
                    stripHTML(p.excerpt || p.content).slice(0, 140) + "…"
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   POST CARD
   ========================================================= */
const PostCard = memo(
  ({ post, onEdit, onDelete, navigate, t, lang, excerpt }) => (
    <article
      className="pm-card"
      onClick={() => {
        if (post.slug) navigate(`/news/${post.slug}`);
      }}
    >
      <div className="pm-thumb">
        {post.thumbnail_url ? (
          <img src={post.thumbnail_url} className="pm-media" alt="" />
        ) : (
          <div className="pm-no-media">{t("admin.post.nomedia")}</div>
        )}
      </div>

      <div className="pm-content">
        <span className={`pm-type ${post.type}`}>
          {t(`admin.post.edit_form.category.${post.type}`)}
        </span>

        <h3 className="pm-title">
          <TranslatableText text={post.title} lang={lang} />
        </h3>

        {post.eventDate && (
          <div className="pm-meta">
            🗓{" "}
            {new Date(post.eventDate.date).toLocaleDateString("vi-VN")} · 🕒{" "}
            {post.eventDate.startTime || "??:??"}–
            {post.eventDate.endTime || "??:??"}
          </div>
        )}

        {post.location && (
          <div className="pm-meta">
            📍 <TranslatableText text={post.location} lang={lang} />
          </div>
        )}

        {excerpt && <p className="pm-excerpt">{excerpt}</p>}
      </div>

      <div className="pm-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={t("admin.post.edit")}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={t("admin.post.delete")}
        >
          🗑️
        </button>
      </div>
    </article>
  )
);

/* =========================================================
   SHARED FORM — ADD + EDIT (FULL FIELD)
   ========================================================= */
function PostForm({ post, onClose, onSaved }) {
  const { t } = useI18n();
  const quillRef = useRef(null);

  const isEdit = !!post?.id;

  /* BASIC */
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail_url || "");
  const [fileType, setFileType] = useState(post?.file_type || "");
  const [uploading, setUploading] = useState(false);
  const [type, setType] = useState(post?.type || "success_story");

  /* PROGRAM MULTI */
  const [programms, setProgramms] = useState([]);
  const [programSearch, setProgramSearch] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState(() =>
    normalizeArray(post?.progId)
  );

  useEffect(() => {
    getProgramsList()
      .then((res) => setProgramms(res.data || []))
      .catch(() => {});
  }, []);

  const filteredPrograms = programms.filter((p) =>
    p.name?.toLowerCase().includes(programSearch.toLowerCase())
  );

  const handleProgramChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedPrograms(values);
  };

  const handleSelectAllPrograms = () => {
    setSelectedPrograms(filteredPrograms.map((p) => p.id));
  };

  const handleClearAllPrograms = () => {
    setSelectedPrograms([]);
  };

  /* EVENT */
  const [eventDate, setEventDate] = useState({
    date: post?.eventDate?.date || "",
    startTime: post?.eventDate?.startTime || "",
    endTime: post?.eventDate?.endTime || "",
  });
  const [location, setLocation] = useState(post?.location || "");

  /* FILE UPLOAD */
  const handleFileChange = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setThumbnail(url);
      setFileType(type);
      alert("✅ " + (t("admin.post.upload_success") || "Upload successful"));
    } catch (err) {
      alert("❌ " + (t("admin.post.upload_error") || "Error uploading file"));
    } finally {
      setUploading(false);
    }
  };

  /* VIDEO UPLOAD */
  const handleVideoUpload = useCallback(async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    const choice = window.prompt(
      "🎥 Dán link YouTube hoặc bấm Cancel để tải video từ máy:"
    );

    if (choice && choice.startsWith("http")) {
      const match = choice.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
      );
      if (match) {
        quill.insertEmbed(
          range.index,
          "video",
          `https://www.youtube.com/embed/${match[1]}`
        );
      }
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      quill.insertText(range.index, "⏳ Đang tải video...", "italic", true);
      try {
        const url = await upFileToStorage(file);
        quill.deleteText(range.index, 18);
        quill.insertEmbed(range.index, "video", url);
      } catch {
        quill.deleteText(range.index, 18);
      }
    };
  }, []);

  const quillModules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: ["12px", "14px", "16px", "18px", "20px", "24px", "32px"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
      handlers: { video: handleVideoUpload },
    },
    clipboard: { matchVisual: false },
  };

  const quillFormats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title,
      content,
      thumbnail_url: thumbnail,
      file_type: fileType,
      progId: selectedPrograms,
      type,
      eventDate: type === "upcoming_event" ? eventDate : null,
      location: type === "upcoming_event" ? location : "",
    };

    try {
      if (isEdit) {
        await updatePostL(post.id, payload);
        alert("✅ " + t("admin.post.edit_form.update_success"));
      } else {
        await createPostL(payload);
        alert("✅ " + t("admin.post.saved"));
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert("❌ " + t("admin.post.edit_form.update_error"));
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>{isEdit ? "✏️ Edit Post" : "➕ Create Post"}</h2>
        <button onClick={onClose}>
          ← {t("admin.post.edit_form.back")}
        </button>
      </div>

      <form className="post-editor" onSubmit={handleSubmit}>
        <label>{t("admin.post.edit_form.category_label")}</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="success_story">
            {t("admin.post.edit_form.category.success_story")}
          </option>
          <option value="career_tip">
            {t("admin.post.edit_form.category.career_tip")}
          </option>
          <option value="upcoming_event">
            {t("admin.post.edit_form.category.upcoming_event")}
          </option>
        </select>

        <label>{t("admin.post.edit_form.title_label")}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>{t("admin.post.edit_form.program")}</label>
        <input
          placeholder="🔍 Search program..."
          value={programSearch}
          onChange={(e) => setProgramSearch(e.target.value)}
        />

        <select
          multiple
          value={selectedPrograms}
          onChange={handleProgramChange}
          style={{ minHeight: 140 }}
        >
          {filteredPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {selectedPrograms.includes(p.id) ? "✓ " : ""}
              {p.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={handleSelectAllPrograms}>
            Select all
          </button>
          <button type="button" onClick={handleClearAllPrograms}>
            Clear all
          </button>
          <span style={{ marginLeft: "auto", opacity: 0.6 }}>
            {selectedPrograms.length}/{filteredPrograms.length}
          </span>
        </div>

        <label>{t("admin.post.edit_form.thumbnail")}</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e.target.files[0], "image")}
        />
        {uploading && <p>{t("admin.post.uploading")}</p>}
        {thumbnail && <img src={thumbnail} width={220} alt="" />}

        {type === "upcoming_event" && (
          <>
            <label>{t("admin.post.edit_form.event_date")}</label>
            <input
              type="date"
              value={eventDate.date}
              onChange={(e) =>
                setEventDate((p) => ({ ...p, date: e.target.value }))
              }
            />

            <label>{t("admin.post.edit_form.start_time")}</label>
            <input
              type="time"
              value={eventDate.startTime}
              onChange={(e) =>
                setEventDate((p) => ({ ...p, startTime: e.target.value }))
              }
            />

            <label>{t("admin.post.edit_form.end_time")}</label>
            <input
              type="time"
              value={eventDate.endTime}
              onChange={(e) =>
                setEventDate((p) => ({ ...p, endTime: e.target.value }))
              }
            />

            <label>{t("admin.post.edit_form.location")}</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </>
        )}

        <label>{t("admin.post.edit_form.content")}</label>
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={setContent}
          modules={quillModules}
          formats={quillFormats}
          style={{ height: 400, marginBottom: 50 }}
        />

        <div className="editor-actions">
          <button type="submit">
            💾 {t("admin.post.edit_form.save")}
          </button>
          <button type="button" onClick={onClose}>
            ❌ {t("admin.post.edit_form.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
