import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  getProgrammsList,
  getSavedProgramms,
  saveProgrammById,
  unsaveProgrammById,
  addNewProgramm,
  createPost,
  getPostsList,
  deletePostById,
  updatePost,
  upFileToStorage,
} from "../../api";

import ProgrammsList from "../../components/admin/management/programms/List";
import ListOfSharedProgramms from "../../components/admin/management/programms/Shared";
import FilterSearch from "../../components/FilterSearch";
import PostEditor from "../../components/PostEditor";
import AddProgramForm from "../../components/admin/management/programms/Form";
import { useI18n } from "../../i18n";

import "./ProgrammsManagement.css";

/* =========================================================
   🟦 MAIN MANAGEMENT PAGE
   ========================================================= */
export default function ProgrammsManagement() {
  const navigate = useNavigate();
  const { t } = useI18n();

  // -------------------- Programms --------------------
  const [programms, setProgramms] = useState([]);
  const [filteredProgramms, setFilteredProgramms] = useState([]);
  const [savedProgramsMap, setSavedProgramsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState("my");
  const [showAddForm, setShowAddForm] = useState(false);

  // -------------------- Posts --------------------
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // post đang edit

  // -------------------- Load Data --------------------
  useEffect(() => {
    loadProgramms();
    loadSavedPrograms();
  }, []);

  useEffect(() => {
    if (activePage === "post") loadPosts();
  }, [activePage]);

  const loadProgramms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProgrammsList();
      setProgramms(res.data || []);
      setFilteredProgramms(res.data || []);
    } catch {
      setError("Failed to load programms");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPrograms = async () => {
    try {
      const res = await getSavedProgramms();
      const map = {};
      (res.data || []).forEach((p) => (map[p._id] = true));
      setSavedProgramsMap(map);
    } catch {
      setError("Failed to load saved programms");
    }
  };

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await getPostsList();
      setPosts(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("❌ Lỗi tải bài viết:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // -------------------- Handlers --------------------
  const handleAddNewProgramm = async (newData) => {
    try {
      await addNewProgramm(newData);
      alert("✅ Added successfully");
      setShowAddForm(false);
      loadProgramms();
    } catch {
      alert("❌ Failed to add program");
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá bài viết này?")) return;
    try {
      await deletePostById(id);
      alert("✅ Đã xoá bài viết");
      loadPosts();
    } catch {
      alert("❌ Lỗi khi xoá bài viết");
    }
  };

  const toggleSaveProgramm = async (programmId, isSaved) => {
    setSavedProgramsMap((prev) => {
      const copy = { ...prev };
      if (isSaved) delete copy[programmId];
      else copy[programmId] = true;
      return copy;
    });
    try {
      isSaved
        ? await unsaveProgrammById(programmId)
        : await saveProgrammById(programmId);
      await loadSavedPrograms();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterChange = (filters) => {
    const result = programms.filter((p) => {
      const matchType = !filters.type_category || p.type_category === filters.type_category;
      const matchLand = !filters.land || p.land === filters.land;
      const matchDeadline =
        !filters.deadline || (p.deadline && new Date(p.deadline) <= new Date(filters.deadline));
      const matchDegree = !filters.degrees || p.degrees === filters.degrees;
      const matchAge = !filters.age || (p.ages && p.ages.toString().includes(filters.age));
      return matchType && matchLand && matchDeadline && matchDegree && matchAge;
    });
    setFilteredProgramms(result);
  };

  const handleSelectProgramm = (programm) =>
    navigate(`/programm/${programm._id}`, { state: { programm } });

  const savedProgramsList = programms.filter((p) => savedProgramsMap[p._id]);
  const displayedProgramms = useMemo(() => filteredProgramms, [filteredProgramms]);

  const tabs = [
    { id: "my", label: "My Programms" },
    { id: "saved", label: "Saved Programms" },
    { id: "shared", label: "Shared Programms" },
    { id: "post", label: "Post" },
  ];

  // -------------------- RENDER --------------------
  return (
    <div className="container">
      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${activePage === tab.id ? "active" : ""}`}
            onClick={() => setActivePage(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* ========================= MY PROGRAMS ========================= */}
      {activePage === "my" && (
        <div className="programs-section">
          <div className="programm-toolbar">
            <FilterSearch
              programms={programms}
              onFilterChange={handleFilterChange}
              onSelectProgramm={handleSelectProgramm}
            />
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              + Add New Program
            </button>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && displayedProgramms.length === 0 && <p>No programms found</p>}
          {!loading && displayedProgramms.length > 0 && (
            <ProgrammsList
              programms={displayedProgramms}
              savedPrograms={savedProgramsMap}
              toggleSaveProgramm={toggleSaveProgramm}
            />
          )}
          {showAddForm && (
            <AddProgramForm
              onSubmit={handleAddNewProgramm}
              onClose={() => setShowAddForm(false)}
              defaultValues={{
                title: "",
                company: "",
                logoL: "",
                type: "",
                degrees: "",
                duration: "",
                land: "",
                requirement: { education: "" },
                details: { overview: "" },
              }}
            />
          )}
        </div>
      )}

      {/* ========================= SAVED ========================= */}
      {activePage === "saved" && (
        <ProgrammsList
          programms={savedProgramsList}
          savedPrograms={savedProgramsMap}
          toggleSaveProgramm={toggleSaveProgramm}
        />
      )}

      {/* ========================= SHARED ========================= */}
      {activePage === "shared" && <ListOfSharedProgramms />}

      {/* ========================= POST ========================= */}
      {activePage === "post" && (
        <div className="post-management-section">
          <div className="post-toolbar">
            <button
              className={`toggle-btn ${showAddPost ? "active" : ""}`}
              onClick={() => {
                if (editingPost) setEditingPost(null);
                else setShowAddPost((prev) => !prev);
              }}
            >
              {showAddPost ? "📜 Xem danh sách bài viết" : "➕ Tạo bài viết mới"}
            </button>
          </div>

          {/* Add Post */}
          {showAddPost && !editingPost && (
            <PostEditor
              onSave={async (post) => {
                try {
                  await createPost(post);
                  alert("✅ Bài viết đã lưu");
                  setShowAddPost(false);
                  loadPosts();
                } catch (error) {
                  console.error(error);
                  alert("❌ Lỗi khi tạo bài viết mới");
                }
              }}
              onCancel={() => setShowAddPost(false)}
            />
          )}

          {/* Edit Post */}
          {editingPost && (
            <EditPostForm
              post={editingPost}
              onClose={() => setEditingPost(null)}
              onSaved={() => loadPosts()}
            />
          )}

          {/* List of Posts */}
          {!showAddPost && !editingPost && (
            <div className="post-list-container">
              <h3>📋 Danh sách bài viết</h3>
              {loadingPosts ? (
                <p>Đang tải...</p>
              ) : posts.length === 0 ? (
                <p>Chưa có bài viết nào</p>
              ) : (
                <div className="post-list">
                  {posts.map((p) => (
                    <div key={p._id} className="post-item">
                      <div className="post-thumb">
                        {p.thumbnail_url?.endsWith(".mp4") ? (
                          <video controls width="220" style={{ borderRadius: "8px" }}>
                            <source src={p.thumbnail_url} type="video/mp4" />
                          </video>
                        ) : p.thumbnail_url ? (
                          <img
                            src={p.thumbnail_url}
                            alt={p.title}
                            style={{ width: "220px", borderRadius: "8px" }}
                          />
                        ) : (
                          <p>No media available</p>
                        )}
                      </div>
                      <div className="post-info">
                        <h2>{p.type}</h2>
                        <h4>{p.title}</h4>
                        {p.eventDate && <p>📅 {p.eventDate}</p>}
                      </div>
                      <div className="post-actions">
                        <button onClick={() => setEditingPost(p)} className="edit-btn">✏️</button>
                        <button onClick={() => handleDeletePost(p._id)} className="delete-btn">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ========================= EditPostForm ========================= */
export function EditPostForm({ post, onClose, onSaved }) {
  const [type, setType] = useState(post?.type || "success_story");
  const [title, setTitle] = useState(post?.title || "");
  const [thumbnail, setThumbnail] = useState(post?.thumbnail_url || "");
  const [fileType, setFileType] = useState(post?.file_type || "");
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState(post?.content || "");
  const [location, setLocation] = useState(post?.location || "");
  const [eventDate, setEventDate] = useState(post?.eventDate || "");
  const [programms, setProgramms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(post?.progId || "");

  // Trạng thái để kiểm tra xem form có thay đổi hay không
  const [hasChanged, setHasChanged] = useState(false);

  // Khi người dùng thay đổi bất kỳ input nào => setHasChanged(true)
  const markChanged = () => setHasChanged(true);

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

  const handleFileChange = async (file, type) => {
    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setThumbnail(url);
      setFileType(type);
      setHasChanged(true);
      alert("✅ Upload thành công!");
    } catch {
      alert("❌ Upload thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanged) {
      const confirmCancel = window.confirm(
        "Bạn có chắc muốn hủy? Mọi thay đổi sẽ không được lưu."
      );
      if (!confirmCancel) return;
    }
    onClose && onClose();
  };

  const handleSubmit = async (e) => {
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

    try {
      await updatePost(post._id, postData);
      alert("✅ Bài viết đã được cập nhật!");
      if (onSaved) onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật bài viết");
    }
  };

  return (
    <div className="editor-container">
      {/* Thanh tiêu đề và nút quay lại */}
      <div className="editor-header">
        <h2>✏️ Chỉnh sửa bài viết</h2>
        <button className="cancel-btn-top" onClick={handleCancel}>
          ← Quay lại
        </button>
      </div>

      <div className="post-editor-body">
        <form className="post-editor" onSubmit={handleSubmit}>
          <label>Loại bài viết</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              markChanged();
            }}
          >
            <option value="success_story">Success Story</option>
            <option value="career_tip">Career Tip</option>
            <option value="upcoming_event">Upcoming Event</option>
          </select>

          <label>Tiêu đề</label>
          <input
            type="text"
            placeholder="Tiêu đề bài viết"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markChanged();
            }}
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
            onProgramSelect={(value) => {
              setSelectedProgram(value);
              markChanged();
            }}
          />

          {(type === "success_story" || type === "career_tip") && (
            <div className="quill-container">
              <label>Nội dung bài viết</label>
              <ReactQuill
                className="post-editor-quill"
                theme="snow"
                value={content}
                onChange={(v) => {
                  setContent(v);
                  markChanged();
                }}
                modules={{
                  toolbar: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["bold", "italic", "underline"],
                    [{ align: [] }],
                    ["link", "image"],
                  ],
                }}
              />
            </div>
          )}

          {type === "upcoming_event" && (
            <>
              <label>Địa điểm tổ chức</label>
              <input
                type="text"
                placeholder="Nhập địa điểm"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  markChanged();
                }}
              />

              <label>Ngày diễn ra sự kiện</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  markChanged();
                }}
              />
            </>
          )}

          <div className="editor-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? "Đang tải..." : "💾 Lưu thay đổi"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{ marginLeft: "10px", backgroundColor: "#ccc" }}
            >
              Hủy
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="post-preview">
          <h3>👁️ Xem trước</h3>
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
        </div>
      </div>
    </div>
  );
}


/* ========================= Sub Components ========================= */
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

