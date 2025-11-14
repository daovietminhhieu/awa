// ⚡️ src/pages/admin/programms/PostManagement.jsx
import "./quillConfig";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getPostsList,
  createPost,
  updatePost,
  removePost,
  getProgrammsList,
  upFileToStorage,
} from "../../../../api";
import PostEditor from "../../../../components/PostEditor";
import TranslatableText from "../../../../TranslateableText";
import { useI18n } from "../../../../i18n";
import { useNavigate } from "react-router-dom";
import "./PostManagement.css";

/* =========================================================
   MAIN COMPONENT
   ========================================================= */
export default function PostManagement() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // ⚡ useCallback để không tạo lại function mỗi render
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPostsList();
      setPosts(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải bài viết:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDeletePost = async (id) => {
    if (!window.confirm(t("admin.post.confirm_delete"))) return;
    try {
      await removePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      alert("✅ " + t("admin.post.deleted"));
    } catch {
      alert("❌ " + t("admin.post.delete_error"));
    }
  };

  return (
    <div className="post-management-section">
      <div className="post-toolbar">
        <button
          className={`toggle-btn ${showAddPost ? "active" : ""}`}
          onClick={() => {
            setEditingPost(null);
            setShowAddPost((prev) => !prev);
          }}
        >
          {showAddPost ? (
            <TranslatableText text={t("admin.post.show_post_list")} lang={lang} />
          ) : (
            <TranslatableText text={t("admin.post.create_post")} lang={lang} />
          )}
        </button>
      </div>

      {showAddPost && !editingPost && (
        <PostEditor
          onSave={async (post) => {
            try {
              const res = await createPost(post);
              setPosts((prev) => [res.data, ...prev]);
              alert("✅ " + t("admin.post.saved"));
              setShowAddPost(false);
            } catch {
              alert("❌ " + t("admin.post.create_error"));
            }
          }}
          onCancel={() => setShowAddPost(false)}
        />
      )}

      {editingPost && (
        <EditPostForm
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={loadPosts}
        />
      )}

      {!showAddPost && !editingPost && (
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
                  key={p._id}
                  post={p}
                  onEdit={() => setEditingPost(p)}
                  onDelete={() => handleDeletePost(p._id)}
                  navigate={navigate}
                  t={t}
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
   SUBCOMPONENTS
   ========================================================= */

const PostCard = React.memo(({ post, onEdit, onDelete, navigate, t }) => (
  <div
    className="post-item"
    onClick={() => {
      const map = {
        success_story: `/success-story-detail/${post._id}`,
        career_tip: `/tip-detail/${post._id}`,
        upcoming_event: `/event-detail/${post._id}`,
      };
      navigate(map[post.type] || "#");
    }}
  >
    <div className="post-thumb">
      {post.thumbnail_url?.endsWith(".mp4") ? (
        <video controls width="220" style={{ borderRadius: 8 }}>
          <source src={post.thumbnail_url} type="video/mp4" />
        </video>
      ) : post.thumbnail_url ? (
        <img src={post.thumbnail_url} alt={post.title} width={220} style={{ borderRadius: 8 }} />
      ) : (
        <p>{t("admin.post.nomedia")}</p>
      )}
    </div>

    <div className="post-info">
      <h2>{t(`admin.post.edit_form.category.${post.type}`)}</h2>
      <h4>{post.title}</h4>
      {post.eventDate && (
        <p>
          🕒 {post.eventDate.startTime || "??:??"} –{" "}
          {post.eventDate.endTime || "??:??"}, ngày{" "}
          {new Date(post.eventDate.date).toLocaleDateString("vi-VN")}
        </p>
      )}
    </div>

    <div className="post-actions">
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="edit-btn">✏️</button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="delete-btn">🗑️</button>
    </div>
  </div>
));

// ⚡ src/pages/admin/programms/PostManagement.jsx
// Quill: chỉ cho font sans-serif và size px


export function EditPostForm({ post, onClose, onSaved }) {
  const { t, lang } = useI18n();
  const quillRef = useRef(null);

  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail_url || "");
  const [fileType, setFileType] = useState(post?.file_type || "");
  const [uploading, setUploading] = useState(false);
  const [programms, setProgramms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(post?.progId || "");
  const [selectedType, setSelectedType] = useState(post?.type || "success_story");

  useEffect(() => {
    getProgrammsList()
      .then(res => setProgramms(res.data))
      .catch(() => {});
  }, []);

  const handleFileChange = async (file, type) => {
    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setThumbnail(url);
      setFileType(type);
      alert("✅ " + t("admin.post.upload_success"));
    } catch {
      alert("❌ " + t("admin.post.upload_error"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !thumbnail || !selectedProgram || !selectedType) {
      alert("⚠️ " + t("admin.post.missing_fields"));
      return;
    }

    try {
      await updatePost(post._id, {
        title,
        thumbnail_url: thumbnail,
        file_type: fileType,
        content,
        progId: selectedProgram,
        type: selectedType,
      });
      alert("✅ " + t("admin.post.edit_form.update_success"));
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("❌ " + t("admin.post.edit_form.update_error"));
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>✏️ {t("admin.post.edit_form.title")}</h2>
        <button className="cancel-btn-top" onClick={onClose}>
          ← {t("admin.post.edit_form.back")}
        </button>
      </div>

      <form className="post-editor" onSubmit={handleSubmit}>
        {/* Loại bài viết */}
        <label>{t("admin.post.edit_form.category_label")}</label>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="success_story">{t("admin.post.edit_form.category.success_story")}</option>
          <option value="career_tip">{t("admin.post.edit_form.category.career_tip")}</option>
          <option value="upcoming_event">{t("admin.post.edit_form.category.upcoming_event")}</option>
        </select>

        {/* Tiêu đề */}
        <label>{t("admin.post.edit_form.title_label")}</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        {/* Chọn chương trình */}
        <label>{t("admin.post.edit_form.program")}</label>
        <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
          <option value="">{t("admin.post.edit_form.select_program")}</option>
          {programms.map((prog) => (
            <option key={prog._id} value={prog._id}>
              <TranslatableText text={prog.title} lang={lang} />
            </option>
          ))}
        </select>

        {/* Ảnh hoặc video */}
        <label>{t("admin.post.edit_form.thumbnail")}</label>
        <input type="file" onChange={(e) => handleFileChange(e.target.files[0], "image")} />
        {uploading && <p>{t("admin.post.uploading")}</p>}
        {thumbnail && (
          <img src={thumbnail} alt="thumbnail" width="220" style={{ borderRadius: 8 }} />
        )}

        {/* Nội dung */}
        <label>{t("admin.post.edit_form.content")}</label>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={{
            toolbar: [
              [{ font: ["arial", "verdana", "helvetica", "tahoma"] }], // sans-serif only
              [{ size: ["12px","14px","16px","18px","20px","24px","28px","32px"] }], // px size
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ align: [] }],
              ["link", "image", "video"],
              ["clean"],
            ],
          }}
          formats={[
            "font",
            "size",
            "header",
            "bold",
            "italic",
            "underline",
            "strike",
            "align",
            "link",
            "image",
            "video",
          ]}
        />

        <div className="editor-actions">
          <button type="submit" className="save-btn">
            💾 {t("admin.post.edit_form.save")}
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            ❌ {t("admin.post.edit_form.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}


