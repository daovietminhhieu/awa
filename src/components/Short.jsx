import React, { useState, useEffect, useRef } from "react";

import './Short.css'
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function SuccessStories() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t } = useI18n();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", content: "", thumbnail_url: "" });
  const [fileType, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 📦 Lấy dữ liệu
  useEffect(() => {
    (async () => {
      try {
        const result = await getPostsByType("success_story");
        setStories(result.data.map((s) => ({ ...s, expanded: false })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getFileTypeFromUrl = (url) => {
    if (!url) return null;
    const ext = url.split(".").pop().toLowerCase().split(/\#|\?/)[0];
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
    return null;
  };

  const toggleExpand = (id) =>
    setStories((prev) =>
      prev.map((s) => (s._id === id ? { ...s, expanded: !s.expanded } : s))
    );

  const startEdit = (story) => {
    setEditingId(story._id);
    setEditData(story);
    setFileType(getFileTypeFromUrl(story.thumbnail_url));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Chỉ chấp nhận ảnh hoặc video!");
      return;
    }

    setUploading(true);
    try {
      const url = await upFileToStorage(file);
      setEditData((prev) => ({ ...prev, thumbnail_url: url }));
      setFileType(file.type.startsWith("video/") ? "video" : "image");
    } catch (err) {
      alert("Tải file thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updatePost(id, editData);
      alert("Cập nhật thành công!");
      setStories((prev) =>
        prev.map((s) => (s._id === id ? { ...s, ...editData } : s))
      );
      setEditingId(null);
    } catch {
      alert("Cập nhật thất bại.");
    }
  };

  if (loading) return <p>{t("loading") || "Loading..."}</p>;
  if (error) return <p>{t("error_fetching_data") || "Error loading data"}</p>;

  return (
    <section className="success-stories section">
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        loop={stories.length > 1}
        className="success-stories-swiper"
      >
        {stories.map((story) => (
          <SwiperSlide key={story._id}>
            <article className="success-story-card">
              <div className="success-stories-header">
                <h2 className="section-stories-title">
                  🎓 {t("short.stories.title") || "Câu chuyện thành công"}
                </h2>
               
              </div>

              <div 
                className="success-stories-content"
                onClick={() => navigate(`/success-story-detail/${story._id}`)}
              >
                <div
                  className="story-left clickable"
                  onClick={() => navigate(`/success-story-detail/${story._id}`)}
                >
                  {getFileTypeFromUrl(story.thumbnail_url) === "video" ? (
                    <video
                      src={story.thumbnail_url}
                      controls
                      className="story-media"
                      onError={(e) =>
                        (e.target.outerHTML =
                          '<img src="https://placehold.co/600x400?text=No+Video" class="story-media" />')
                      }
                    />
                  ) : (
                    <img
                      src={
                        story.thumbnail_url ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={story.title}
                      className="story-media"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/600x400?text=No+Image")
                      }
                    />
                  )}
                </div>

                <div className="story-right">
                  <h3
                    className="story-title clickable"
                    onClick={() =>
                      navigate(`/success-story-detail/${story._id}`)
                    }
                  >
                    {story.title}
                  </h3>
  
                  <div className="story-content">
                    <div
                      className={`story-text ${
                        story.expanded ? "expanded ql-editor" : "collapsed"
                      }`}
                      dangerouslySetInnerHTML={{ __html: story.content }}
                    />
                    {story.content.length > 400 && (
                      <button
                        className="read-more-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(story._id)
                          }
                        }
                      >
                        {story.expanded ? "Ẩn bớt" : "Xem thêm"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
  
              {editingId === story._id && (
                <div className="edit-form">
                  <h4>🛠 Chỉnh sửa bài viết</h4>
  
                  <input
                    type="text"
                    className="input"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Tiêu đề"
                  />
  
                  <ReactQuill
                    theme="snow"
                    value={editData.content}
                    onChange={(content) =>
                      setEditData((prev) => ({ ...prev, content }))
                    }
                    className="editor"
                  />
  
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    {uploading && <p>Đang tải lên...</p>}
                    {editData.thumbnail_url && (
                      <div className="preview">
                        {fileType === "video" ? (
                          <video
                            src={editData.thumbnail_url}
                            controls
                            className="story-media"
                          />
                        ) : (
                          <img
                            src={editData.thumbnail_url}
                            alt="Preview"
                            className="story-media"
                          />
                        )}
                      </div>
                    )}
                  </div>
  
                  <div className="form-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleUpdate(story._id)}
                      disabled={uploading}
                    >
                      💾 Lưu thay đổi
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => setEditingId(null)}
                    >
                      ❌ Hủy
                    </button>
                  </div>
                </div>
              )}
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
    );
  }
  


import { useLocation } from "react-router-dom";



export function WhyChoose() {
  const { t } = useI18n();
  const reasonData = t('short.why_choose.reasons', { returnObjects: true });

// Nếu reasonData không phải là mảng, gán mảng rỗng để tránh lỗi
  const reasons = Array.isArray(reasonData)
    ? reasonData.map((reason, idx) => ({
        ...reason,
        icon: ["💰", "🛤️", "🤝", "⏰"][idx],
      }))
    : [];


  return (
    <section className="why-choose section">
      <h2 className="section-title">{t('short.why_choose.title') || 'Why choose Alowork.com?'}</h2>
      <div className="reasons-grid">
        {reasons.map(({ title, description, icon }, idx) => (
          <div key={idx} className="reason-card">
            <div className="reason-icon">{icon}</div>
            <div className="reason-content">
              <h3 className="reason-title">{title}</h3>
              <p className="reason-desc">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export function Partner() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate("/collabor");
  };

  return (
    <section className="partner-section">
      <div className="partner-inner">
        <h2 className="partner-title">
          {t("short.partners.title")}
        </h2>

        <p className="partner-desc">
          {t("short.partners.become_collaborator_desc")}
        </p>

        <button
          onClick={handleContactClick}
          className="partner-cta-btn"
        >
          {t("short.partners.contact_now") || "Contact now"}
        </button>
      </div>
    </section>
  );
}


import Footer from "./Footer";
import { getPostById, getPostsByType, removePost, updatePost, upFileToStorage } from "../api";
import { useAuth } from "../context/AuthContext";

export function PartnerDetail() {
  const { t } = useI18n();

  return (
    <div>
      <section className="partner-detail-section">
        <div className="partner-detail-container">
          <h2 className="partner-detail-title">
            {t("short.partners.detail.title")}
          </h2>
          <hr className="partner-divider" />

          <div className="partner-detail-content">
            <div className="partner-info">
              <div className="info-item">
                <strong>{t("short.partners.detail.address_label")}:</strong>
                <span>{t("short.partners.detail.address")}</span>
              </div>
              <div className="info-item">
                <strong>{t("short.partners.detail.email_label")}:</strong>
                <span>{t("short.partners.detail.email")}</span>
              </div>
              <div className="info-item">
                <strong>{t("short.partners.detail.phone_label")}:</strong>
                <span>{t("short.partners.detail.phone")}</span>
              </div>
            </div>

            <div className="partner-message">
              <p className="partner-goodbye">
                {t("short.partners.detail.goodbye")}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}




export function TipsAndEventsSection() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t } = useI18n();

  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorTips, setErrorTips] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);

  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventData, setEditEventData] = useState({
    title: "",
    location: "",
    createdAt: "",
    thumbnail_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchTips() {
      try {
        const result = await getPostsByType("career_tip");
        const sorted = result.data
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 3)
          .map((t) => ({ ...t, expanded: false }));
        setTips(sorted);
      } catch (err) {
        setErrorTips(err.message);
      } finally {
        setLoadingTips(false);
      }
    }

    async function fetchEvents() {
      try {
        const result = await getPostsByType("upcoming_event");
        const sorted = result.data
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 3)
          .map((e) => ({ ...e, expanded: false }));
        setEvents(sorted);
      } catch (err) {
        setErrorEvents(err.message);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchTips();
    fetchEvents();
  }, []);

  const getPlainText = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const toggleTipsExpande = (id) => {
    setTips((prev) =>
      prev.map((t) => (t._id === id ? { ...t, expanded: !t.expanded } : t))
    );
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");
    if (!isVideo && !isImage) {
      alert("Chỉ chấp nhận ảnh hoặc video!");
      return;
    }

    setUploading(true);
    try {
      const url = await upFileToStorage(selectedFile);
      setEditEventData((prev) => ({ ...prev, thumbnail_url: url }));
    } catch (err) {
      alert("Tải file thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEditEvent = (event) => {
    setEditingEventId(event._id);
    setEditEventData({
      title: event.title,
      location: event.location,
      createdAt: event.createdAt,
      thumbnail_url: event.thumbnail_url,
    });
  };

  const handleUpdateEvent = async (id) => {
    try {
      await updatePost(id, editEventData);
      alert("Cập nhật thành công!");
      setEvents((prev) =>
        prev.map((event) =>
          event._id === id ? { ...event, ...editEventData } : event
        )
      );
      setEditingEventId(null);
    } catch {
      alert("Cập nhật thất bại.");
    }
  };

  const handleRemoveEvent = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này không?")) return;
    try {
      await removePost(id);
      alert("Xóa thành công");
      setEvents((prev) => prev.filter((event) => event._id !== id));
    } catch {
      alert("Xóa thất bại");
    }
  };

  if (loadingTips || loadingEvents)
    return <p>{t("loading") || "Loading..."}</p>;
  if (errorTips || errorEvents)
    return <p>{t("error_fetching_data") || "Error loading data"}</p>;

  return (
    <section className="tips-events section">
      {/* --------- CẨM NANG NGHỀ NGHIỆP --------- */}
      <div className="tips-guide">
        <h2 className="section-title">{t("short.career_guide")}</h2>
        <div className="stories-grid">
          {tips.map((tip) => {
            const plainText = getPlainText(tip.content);
            return (
              <div
                key={tip._id}
                className="story-card"
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => navigate(`/tip-detail/${tip._id}`)}
              >
                <img src={tip.thumbnail_url} alt={tip.title} loading="lazy" />
                <h3 style={{ textAlign: "center" }}>{tip.title}</h3>

                <div>
                  <div
                    className={`story-text ${
                      tip.expanded ? "expanded ql-editor" : "collapsed"
                    }`}
                    dangerouslySetInnerHTML={{ __html: tip.content }}
                  ></div>

                  {plainText.length > 400 && (
                    <button
                      className="read-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTipsExpande(tip._id);
                      }}
                    >
                      {tip.expanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------- SỰ KIỆN --------- */}
      <div className="event-section" style={{ marginTop: "40px" }}>
        <h2 className="section-title">{t("short.events")}</h2>
        <div className="stories-grid">
          {events.map((event) => (
            <div
              key={event._id}
              className="story-card"
              style={{ cursor: "pointer", position: "relative" }}
              onClick={() => navigate(`/event-detail/${event._id}`)}
            >
              <img src={event.thumbnail_url} alt={event.title} loading="lazy" />
              <h3 style={{ textAlign: "center" }}>{event.title}</h3>
              <p style={{ textAlign: "center" }}>
                <strong>{t("short.event-location")}:</strong> {event.location}
              </p>
              <p style={{ textAlign: "center" }}>
                <strong>{t("short.event-date")}:</strong>{" "}
                {new Date(event.createdAt).toLocaleDateString("vi-VN")}
              </p>

              {currentUser?.role === "admin" && (
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <button onClick={() => startEditEvent(event)}>📝</button>
                  <button onClick={() => handleRemoveEvent(event._id)}>❌</button>
                </div>
              )}

              {editingEventId === event._id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateEvent(event._id);
                  }}
                  className="edit-form"
                >
                  <label>Tiêu đề:</label>
                  <input
                    type="text"
                    value={editEventData.title}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        title: e.target.value,
                      })
                    }
                  />
                  <label>Địa điểm:</label>
                  <input
                    type="text"
                    value={editEventData.location}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        location: e.target.value,
                      })
                    }
                  />
                  <label>Ngày tổ chức:</label>
                  <input
                    type="date"
                    value={editEventData.createdAt.slice(0, 10)}
                    onChange={(e) =>
                      setEditEventData({
                        ...editEventData,
                        createdAt: e.target.value,
                      })
                    }
                  />
                  <label>Upload ảnh/video mới:</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  {uploading && <p>Đang tải lên...</p>}
                  {editEventData.thumbnail_url && (
                    <img
                      src={editEventData.thumbnail_url}
                      alt="preview"
                      width="200"
                      style={{ marginTop: "10px" }}
                    />
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="submit">💾 Lưu</button>
                    <button type="button" onClick={() => setEditingEventId(null)}>
                      ❌ Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}







export function BecomeCollaborator() {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n(); // ✅ Gọi useI18n() 1 lần duy nhất ở đây

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleRegisterClick = () => {
    navigate("/signup");
  };

  return (
    <section
      className="become-collaborator section"
      style={{
        marginTop: "60px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        textAlign: "center",
        background:"linear-gradient(135deg, #e3f2fd, #f9fbff)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <h2 className="section-becomecollab-title">{t('short.become_collaborator.title')}</h2>
      <p>{t('short.become_collaborator.description')}</p>
      <button
        onClick={handleRegisterClick}
        style={{
          padding: "10px 20px",
          margin: "20px 20px",
          fontSize: "16px",
          cursor: "pointer",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {t('short.become_collaborator.register_now')}
      </button>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#fff",
            border: "1px solid #007BFF",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            padding: "15px 20px",
            borderRadius: "8px",
            zIndex: 9999,
            maxWidth: "300px",
          }}
        >
          <strong>{t('short.become_collaborator.greeting') || 'Hello!'}</strong>
          <p>{t('short.become_collaborator.popup_text') || 'Do you want to become a collaborator? Click Signup now to join!'}</p>
          <button
            onClick={handleRegisterClick}
            style={{
              marginTop: "10px",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            {t('short.become_collaborator.register_now')}
          </button>
          <button
            onClick={() => setShowPopup(false)}
            style={{
              marginTop: "10px",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {t('short.become_collaborator.close')}
          </button>
        </div>
      )}
    </section>
  );
}


/* ===============================
  📖 DETAIL PAGE (Restyled)
================================= */

export function DetailSuccessStory() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPostById(id);
        setStory(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="loading-text">{t("loading")}</p>;
  if (error || !story) return <p className="error-text">{t("short.not_found_story")}</p>;

  return (
    <section className="detail-wrapper">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← {t("short.back")}
      </button>

      <div className="detail-header">
        {story.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i) ? (
          <video src={story.thumbnail_url} controls className="detail-media-full" />
        ) : (
          <img src={story.thumbnail_url} alt={story.title} className="detail-media-full" />
        )}
        <h1 className="detail-main-title">{story.title}</h1>
      </div>

      <div
        className="detail-content ql-editor"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />
    </section>
  );
}

/* ----- TIP DETAIL ----- */
export function TipDetail() {
  const { tipId } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPostById(tipId);
        setTip(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tipId]);

  if (loading) return <p className="loading-text">{t("loading")}</p>;
  if (error || !tip) return <p className="error-text">{t("short.not_found_story")}</p>;

  return (
    <section className="detail-wrapper">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← {t("short.back")}
      </button>

      <div className="detail-header">
        {tip.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i) ? (
          <video src={tip.thumbnail_url} controls className="detail-media-full" />
        ) : (
          <img src={tip.thumbnail_url} alt={tip.title} className="detail-media-full" />
        )}
        <h1 className="detail-main-title">{tip.title}</h1>
      </div>

      <div
        className="detail-content ql-editor"
        dangerouslySetInnerHTML={{ __html: tip.content }}
      />
    </section>
  );
}

/* ----- EVENT DETAIL ----- */
export function EventDetail() {
  const { eventId } = useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPostById(eventId);
        setEvent(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId]);

  if (loading) return <p className="loading-text">{t("loading")}</p>;
  if (error || !event) return <p className="error-text">{t("short.not_found_story")}</p>;

  return (
    <section className="detail-wrapper">
      <button onClick={() => navigate(-1)} className="back-btn">
        ← {t("short.back")}
      </button>

      <div className="detail-header">
        {event.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i) ? (
          <video src={event.thumbnail_url} controls className="detail-media-full" />
        ) : (
          <img src={event.thumbnail_url} alt={event.title} className="detail-media-full" />
        )}
        <h1 className="detail-main-title">{event.title}</h1>
        <p className="event-meta">
          📍 {event.location} | 📅{" "}
          {new Date(event.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      <div
        className="detail-content ql-editor"
        dangerouslySetInnerHTML={{ __html: event.content }}
      />
    </section>
  );
}