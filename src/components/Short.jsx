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
  const [editingStory, setEditingStory] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    thumbnail_url: "",
  });
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const result = await getPostsByType("success_story");
        const enriched = result.data.map((story) => ({
          ...story,
          expanded: false,
        }));
        setStories(enriched);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, []);

  const toggleExpand = (id) => {
    setStories((prev) =>
    prev.map((story) =>
        story._id === id ? { ...story, expanded: !story.expanded } : story
      )
    );
  };

  const startEdit = (story) => {
    setEditingStory(story._id);
    setEditData({
      title: story.title,
      content: story.content,
      thumbnail_url: story.thumbnail_url,
    });
    setFile(null);
    setFileType(getFileTypeFromUrl(story.thumbnail_url));
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
      setEditData((prev) => ({
        ...prev,
        thumbnail_url: url,
      }));
      setFileType(isVideo ? "video" : "image");
      setFile(selectedFile);
    } catch (err) {
      alert("Tải file thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateSuccessStories = async (id, updates) => {
    try {
      await updatePost(id, updates);
      alert("Cập nhật thành công!");
      setStories((prev) =>
        prev.map((story) => (story._id === id ? { ...story, ...updates } : story))
      );
      setEditingStory(null);
    } catch (err) {
      alert("Cập nhật thất bại.");
    }
  };

  const handleRemoveSuccessStories = async (id) => {
    try {
      await removePost(id);
      alert("Xóa thành công");
      setStories((prev) => prev.filter((story) => story._id !== id));
      if (editingStory === id) setEditingStory(null);
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  function getFileTypeFromUrl(url) {
    if (!url) return null;
    const ext = url.split(".").pop().toLowerCase().split(/\#|\?/)[0];
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "image";
    return null;
  }

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
        {stories.map(({ _id, title, content, thumbnail_url, expanded }) => (
          <SwiperSlide key={_id}>
            <article className="success-story-card">
              <div className="success-stories-header">
                <h2 className="section-stories-title">
                  🎓 {t("short.stories.title") || "Câu chuyện thành công"}
                </h2>
          
                {currentUser?.role === "recruiter" && (
                  <div style={{ display: "flex", textAlign: "right", marginBottom: "10px", gap: "5px" }}>
                  <button onClick={() => startEdit({ _id, title, content, thumbnail_url })}>
                    📝 Edit
                  </button>
                  <button onClick={() => handleRemoveSuccessStories(_id)}>
                    ❌ Remove
                  </button>
                </div>
                )}
              </div>

              <div className="success-stories-content">
                <div
                  className="story-left clickable"
                  onClick={() =>
                    navigate(`/success-story-detail/${_id}`, {
                      state: { story: { _id, title, content, thumbnail_url } },
                    })
                  }
                >
                  {(() => {
                    const fileType = getFileTypeFromUrl(thumbnail_url);
                    if (fileType === "video") {
                      return (
                        <video
                          src={thumbnail_url}
                          controls
                          className="story-media"
                          onError={(e) => {
                            e.target.outerHTML = '<img src="https://placehold.co/600x400?text=No+Video" class="story-media" />';
                          }}
                        />
                      );
                    }
                    return (
                      <img
                        src={thumbnail_url || "https://placehold.co/600x400?text=No+Image"}
                        alt={title}
                        className="story-media"
                        onError={(e) =>
                          (e.target.src = "https://placehold.co/600x400?text=No+Image")
                        }
                      />
                    );
                  })()}
                </div>

                <div className="story-right">
                  <h3
                    className="story-title clickable"
                    onClick={() =>
                      navigate(`/success-story-detail/${_id}`, {
                        state: { story: { _id, title, content, thumbnail_url } },
                      })
                    }
                  >
                    {title}
                  </h3>

                  <div
                    className={`story-content ${expanded ? "expanded" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: expanded
                        ? content
                        : content?.length > 400
                        ? content.slice(0, 400) + "..."
                        : content,
                    }}
                    style={{ textAlign: "center" }}
                  ></div>

                  {content?.length > 400 && (
                    <button
                      className="story-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpand(_id);
                      }}
                    >
                      {expanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                  )}
                </div>
              </div>

              {/* 👉 FORM CHỈNH SỬA */}
              {editingStory === _id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSuccessStories(_id, editData);
                  }}
                  className="edit-form"
                  style={{
                    alignSelf:"center",
                    marginTop: "20px",
                    background: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Nội dung:</label>
                    <ReactQuill
                      theme="snow"
                      value={editData.content}
                      onChange={(val) => setEditData({ ...editData, content: val })}
                      style={{ backgroundColor: "white" }}
                    />
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label>Upload ảnh/video mới:</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    {uploading && <p>Đang tải lên...</p>}
                    {editData.thumbnail_url && (
                      <>
                        {fileType === "video" ? (
                          <video src={editData.thumbnail_url} controls width="240" />
                        ) : (
                          <img src={editData.thumbnail_url} alt="preview" width="220" />
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" disabled={uploading}>
                      💾 {uploading ? "Đang lưu..." : "Lưu lại"}
                    </button>
                    <button type="button" onClick={() => setEditingStory(null)}>
                      ❌ Hủy
                    </button>
                  </div>
                </form>
              )}
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );

}




import { useLocation } from "react-router-dom";

export function DetailSuccessStory() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  const story = location.state?.story;
  const render = null;

  if (!story) return <p>{t('short.not_found_story')}</p>;

  return (
    <>
      <h3 style={{maxWidth:"900px", height:"600px",margin:"100px auto", display:"flex", justifyContent:"center", alignItems:"center"}}>{t('programm.detail.loading_programm')}</h3>
      {render && <>
        <section className="detail-story section">
          <button onClick={() => navigate(-1)} className="back-btn">
            {t('short.back')}
          </button>
          <div className="detail-card">
            <img src={story.imageUrl} alt={story.title} className="detail-image" />
            <h2 className="detail-title">{story.title}</h2>
            <p className="detail-desc">{story.description}</p>
          </div>
        </section>
      </>}
    
    </>
  );
}



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
import { getPostsByType, removePost, updatePost, upFileToStorage } from "../api";
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

  // State chính
  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorTips, setErrorTips] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);

  // State chỉnh sửa
  const [editingTipId, setEditingTipId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  const [editTipData, setEditTipData] = useState({
    title: "",
    content: "",
    thumbnail_url: "",
  });

  const [editEventData, setEditEventData] = useState({
    title: "",
    location: "",
    createdAt: "",
    thumbnail_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load tips & events
  useEffect(() => {
    async function fetchTips() {
      try {
        const result = await getPostsByType("career_tip");
        const sortedTips = result.data
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 3);
        setTips(sortedTips);
      } catch (err) {
        setErrorTips(err.message);
      } finally {
        setLoadingTips(false);
      }
    }

    async function fetchEvents() {
      try {
        const result = await getPostsByType("upcoming_event");
        const sortedEvents = result.data
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 3);
        setEvents(sortedEvents);
      } catch (err) {
        setErrorEvents(err.message);
      } finally {
        setLoadingEvents(false);
      }
    }

    fetchTips();
    fetchEvents();
  }, []);

  // Upload file handler (dùng chung cho cả tips và events)
  const handleFileChange = async (e, type = "tip") => {
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
      if (type === "tip") {
        setEditTipData((prev) => ({ ...prev, thumbnail_url: url }));
      } else {
        setEditEventData((prev) => ({ ...prev, thumbnail_url: url }));
      }
    } catch (err) {
      alert("Tải file thất bại: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Bắt đầu chỉnh sửa tip
  const startEditTip = (tip) => {
    setEditingTipId(tip._id);
    setEditTipData({
      title: tip.title,
      content: tip.content,
      thumbnail_url: tip.thumbnail_url,
    });
  };

  // Bắt đầu chỉnh sửa event
  const startEditEvent = (event) => {
    setEditingEventId(event._id);
    setEditEventData({
      title: event.title,
      location: event.location,
      createdAt: event.createdAt,
      thumbnail_url: event.thumbnail_url,
    });
  };

  // Lưu chỉnh sửa tip
  const handleUpdateTip = async (id) => {
    try {
      await updatePost(id, editTipData);
      alert("Cập nhật thành công!");
      setTips((prev) =>
        prev.map((tip) => (tip._id === id ? { ...tip, ...editTipData } : tip))
      );
      setEditingTipId(null);
    } catch {
      alert("Cập nhật thất bại.");
    }
  };

  // Lưu chỉnh sửa event
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

  // Xóa tip
  const handleRemoveTip = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này không?")) return;
    try {
      await removePost(id);
      alert("Xóa thành công");
      setTips((prev) => prev.filter((tip) => tip._id !== id));
      if (editingTipId === id) setEditingTipId(null);
    } catch {
      alert("Xóa thất bại");
    }
  };

  // Xóa event
  const handleRemoveEvent = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này không?")) return;
    try {
      await removePost(id);
      alert("Xóa thành công");
      setEvents((prev) => prev.filter((event) => event._id !== id));
      if (editingEventId === id) setEditingEventId(null);
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
      {/* Cẩm nang nghề nghiệp */}
      <div className="tips-guide">
        <h2 className="section-title">{t("short.career_guide")}</h2>
        <div className="stories-grid">
          {tips.map(({ _id, title, content, thumbnail_url }, idx) => (
            <div
              key={_id}
              className="story-card"
              style={{ cursor: "pointer", position: "relative" }}
            >
              <img src={thumbnail_url} alt={title} loading="lazy" />
              <h3 style={{ textAlign: "center" }}>{title}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: content }}
                style={{ textAlign: "center" }}
              ></div>

              {/* Chức năng chỉnh sửa & xóa chỉ cho recruiter */}
              {currentUser?.role === "recruiter" && (
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <button onClick={() => startEditTip({ _id, title, content, thumbnail_url })}>
                    📝
                  </button>
                  <button onClick={() => handleRemoveTip(_id)}>❌</button>
                </div>
              )}

              {/* Form chỉnh sửa tip */}
              {editingTipId === _id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateTip(_id);
                  }}
                  style={{
                    marginTop: "10px",
                    background: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      value={editTipData.title}
                      onChange={(e) =>
                        setEditTipData({ ...editTipData, title: e.target.value })
                      }
                      required
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Nội dung:</label>
                    <ReactQuill
                      theme="snow"
                      value={editTipData.content}
                      onChange={(val) => setEditTipData({ ...editTipData, content: val })}
                      style={{ backgroundColor: "white" }}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Upload ảnh/video mới:</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileChange(e, "tip")}
                      ref={fileInputRef}
                    />
                    {uploading && <p>Đang tải lên...</p>}
                    {editTipData.thumbnail_url && (
                      <>
                        {editTipData.thumbnail_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={editTipData.thumbnail_url}
                            controls
                            width="240"
                            style={{ marginTop: "10px" }}
                          />
                        ) : (
                          <img
                            src={editTipData.thumbnail_url}
                            alt="preview"
                            width="220"
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" disabled={uploading}>
                      💾 {uploading ? "Đang lưu..." : "Lưu lại"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTipId(null)}
                      disabled={uploading}
                    >
                      ❌ Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sự kiện sắp tới */}
      <div className="event-section" style={{ marginTop: "40px" }}>
        <h2 className="section-title">{t("short.events")}</h2>
        <div className="stories-grid">
          {events.map(({ _id, title, location, createdAt, thumbnail_url }, idx) => (
            <div
              key={_id}
              className="story-card"
              style={{ cursor: "pointer", position: "relative" }}
            >
              <img src={thumbnail_url} alt={title} loading="lazy" />
              <h3 style={{ textAlign: "center" }}>{title}</h3>
              <p style={{ textAlign: "center" }}>
                <strong>{t("short.event-location")}:</strong> {location}
              </p>
              <p style={{ textAlign: "center" }}>
                <strong>{t("short.event-date")}:</strong>{" "}
                {new Date(createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>

              {/* Chức năng chỉnh sửa & xóa chỉ cho recruiter */}
              {currentUser?.role === "recruiter" && (
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <button
                    onClick={() =>
                      startEditEvent({ _id, title, location, createdAt, thumbnail_url })
                    }
                  >
                    📝
                  </button>
                  <button onClick={() => handleRemoveEvent(_id)}>❌</button>
                </div>
              )}

              {/* Form chỉnh sửa event */}
              {editingEventId === _id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateEvent(_id);
                  }}
                  style={{
                    marginTop: "10px",
                    background: "#f9f9f9",
                    padding: "15px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <label>Tiêu đề:</label>
                    <input
                      type="text"
                      value={editEventData.title}
                      onChange={(e) =>
                        setEditEventData({ ...editEventData, title: e.target.value })
                      }
                      required
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Địa điểm:</label>
                    <input
                      type="text"
                      value={editEventData.location}
                      onChange={(e) =>
                        setEditEventData({ ...editEventData, location: e.target.value })
                      }
                      required
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Ngày tổ chức:</label>
                    <input
                      type="date"
                      value={editEventData.createdAt.slice(0, 10)} // format yyyy-mm-dd
                      onChange={(e) =>
                        setEditEventData({
                          ...editEventData,
                          createdAt: e.target.value,
                        })
                      }
                      required
                      style={{ width: "100%", padding: "8px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Upload ảnh/video mới:</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileChange(e, "event")}
                      ref={fileInputRef}
                    />
                    {uploading && <p>Đang tải lên...</p>}
                    {editEventData.thumbnail_url && (
                      <>
                        {editEventData.thumbnail_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={editEventData.thumbnail_url}
                            controls
                            width="240"
                            style={{ marginTop: "10px" }}
                          />
                        ) : (
                          <img
                            src={editEventData.thumbnail_url}
                            alt="preview"
                            width="220"
                            style={{ marginTop: "10px" }}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button type="submit" disabled={uploading}>
                      💾 {uploading ? "Đang lưu..." : "Lưu lại"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingEventId(null)}
                      disabled={uploading}
                    >
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



// Chi tiết cẩm nang nghề nghiệp
export function TipDetail() {
  const { tipId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const tips = [
    {
      id: "1",
      title: "Cách viết CV nổi bật",
      description: "Những mẹo đơn giản để tạo một bản CV ấn tượng trong mắt nhà tuyển dụng.",
      imageUrl: "https://source.unsplash.com/600x400/?cv,resume",
    },
    {
      id: "2",
      title: "Phỏng vấn thành công",
      description: "Chuẩn bị và ứng xử đúng cách để ghi điểm tuyệt đối trong buổi phỏng vấn.",
      imageUrl: "https://source.unsplash.com/600x400/?interview,job",
    },
    {
      id: "3",
      title: "Kỹ năng mềm quan trọng",
      description: "Phát triển kỹ năng giao tiếp, làm việc nhóm và quản lý thời gian hiệu quả.",
      imageUrl: "https://source.unsplash.com/600x400/?skills,communication",
    },
  ];

  const tip = tips.find(t => t.id === tipId);

  if (!tip) return <p>{useI18n().t('short.not_found_story')}</p>;

  return (
    <section className="detail-tip section">
      <button onClick={() => navigate(-1)} className="back-btn">{useI18n().t('short.back')}</button>
      <div className="detail-card">
        <img src={tip.imageUrl} alt={tip.title} className="detail-image" />
        <h2 className="detail-title">{tip.title}</h2>
        <p className="detail-desc">{tip.description}</p>
      </div>
    </section>
  );
}

// Chi tiết sự kiện
export function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const events = [
    {
      id: "1",
      title: "Hội thảo định hướng nghề nghiệp 2025",
      date: "20/10/2025",
      location: "TP.HCM",
      description: "Tham gia hội thảo để định hướng phát triển sự nghiệp trong tương lai.",
      imageUrl: "https://source.unsplash.com/600x400/?career,event",
    },
    {
      id: "2",
      title: "Workshop viết CV chuyên nghiệp",
      date: "10/11/2025",
      location: "Hà Nội",
      description: "Học cách viết CV chuyên nghiệp để gây ấn tượng với nhà tuyển dụng.",
      imageUrl: "https://source.unsplash.com/600x400/?workshop,resume",
    },
  ];

  const event = events.find(e => e.id === eventId);

  if (!event) return <p>{useI18n().t('short.not_found_story')}</p>;

  return (
    <section className="detail-event section">
      <button onClick={() => navigate(-1)} className="back-btn">{useI18n().t('short.back')}</button>
      <div className="detail-card">
        <img src={event.imageUrl} alt={event.title} className="detail-image" />
        <h2 className="detail-title">{event.title}</h2>
        <p><strong>Thời gian:</strong> {event.date}</p>
        <p><strong>Địa điểm:</strong> {event.location}</p>
        <p className="detail-desc">{event.description}</p>
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


