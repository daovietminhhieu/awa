import React, { useState, useEffect } from "react";

import "./Short.css";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import "react-quill-new/dist/quill.snow.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import TranslatableText from "../TranslateableText";
import TranslatedHtml from "../TranslatedHtml";

export function SuccessStories() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const ext = url.split(".").pop().toLowerCase().split(/#|\?/)[0];
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
      return "image";
    return null;
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
          <h2 className="section-stories-title">
            🎓 {t("short.stories.title") || "Câu chuyện thành công"}
          </h2>
            <article className="success-story-card">
              <div
                className="success-stories-content"
                onClick={() => navigate(`/success-story-detail/${story._id}`)}
              >
                <div
                  className="story-left"
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
                    className="story-title"
                    onClick={() =>
                      navigate(`/success-story-detail/${story._id}`)
                    }
                  >
                    <TranslatableText text={story.title} lang={lang} />
                  </h3>

                  <div className="story-content">
                    {/* Dịch nội dung HTML */}
                    <TranslatedHtml
                      html={story.content}
                      lang={lang}
                      isExpanded={true} // Quan trọng: chỉ dịch khi expanded
                      maxLength={400}
                      className={`story-text ${
                        story.expanded ? "expanded ql-editor" : "collapsed"
                      }`}
                    />

                    {story.content.length > 400 && (
                      <div className="read-more-ctner">

                        <button
                          className="reads-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/success-story-detail/${story._id}`);
                          }}
                        >
                          {story.expanded
                            ? t("short.hide") || "Hide"
                            : t("short.more") || "More"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export function TipsAndEventsSection() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const [tips, setTips] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingTips, setLoadingTips] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorTips, setErrorTips] = useState(null);
  const [errorEvents, setErrorEvents] = useState(null);

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
                <h3 style={{ textAlign: "center" }}>
                  <TranslatableText text={tip.title} lang={lang} />
                </h3>
                <div>
                  {/* <TranslatedHtml
                      html={tip.content}
                      lang={lang}
                      className={`story-text ${
                        tip.expanded ? "expanded ql-editor" : "collapsed"
                      }`}
                    /> */}
                  {/* <div
                    className={`story-text ${
                      tip.expanded ? "expanded ql-editor" : "collapsed"
                    }`}
                    dangerouslySetInnerHTML={{ __html: tip.content }}
                  /> */}
                  <TranslatedHtml
                    html={tip.content}
                    lang={lang}
                    isExpanded={true}
                    maxLength={400}
                    className={`story-text ${
                      tip.expanded ? "expanded ql-editor" : "collapsed"
                    }`}
                  />
                  {plainText.length > 400 && (
                    <div className="read-more-ctner ">

                      <button
                        className="reads-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          // toggleTipsExpande(tip._id);
                          navigate(`/tip-detail/${tip._id}`);
                        }}
                      >
                        {tip.expanded
                          ? t("short.hide") || "Hide"
                          : t("short.more") || "More"}
                      </button>
                    </div>
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
              <h3 style={{ textAlign: "center" }}>
                <TranslatableText text={event.title} lang={lang} />
              </h3>
              <p style={{ textAlign: "center" }}>
                <strong>{t("short.event-location")}</strong> <TranslatableText text= {event.location} lang={lang} />
              </p>
              <p style={{ textAlign: "center" }}>
                <strong>{t("short.event-date")}</strong>{" "}
                {new Date(event.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyChoose() {
  const { t } = useI18n();
  const reasonData = t("short.why_choose.reasons", { returnObjects: true });

  // Nếu reasonData không phải là mảng, gán mảng rỗng để tránh lỗi
  const reasons = Array.isArray(reasonData)
    ? reasonData.map((reason, idx) => ({
        ...reason,
        icon: ["💰", "🛤️", "🤝", "⏰"][idx],
      }))
    : [];

  return (
    <section className="why-choose section">
      <h2 className="section-title">
        {t("short.why_choose.title") || "Why choose Alowork.com?"}
      </h2>
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
        <h2 className="partner-title">{t("short.partners.title")}</h2>

        <p className="partner-desc">
          {t("short.partners.become_collaborator_desc")}
        </p>

        <button onClick={handleContactClick} className="partner-cta-btn">
          {t("short.partners.contact_now") || "Contact now"}
        </button>
      </div>
    </section>
  );
}

import Footer from "./Footer";
import { getPostById, getPostsByType } from "../api";

export function PartnerDetail() {
  const { t } = useI18n();

  return (
    <div className="partner-detail-wrapper">
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

export function BecomeCollaborator() {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

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
        background: "linear-gradient(135deg, #e3f2fd, #f9fbff)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <h2 className="section-becomecollab-title">
        {t("short.become_collaborator.title")}
      </h2>

      <p>{t("short.become_collaborator.description")}</p>

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
          backgroundColor: "rgb(249, 115, 22)",
        }}
      >
        {t("short.become_collaborator.register_now")}
      </button>

      {/* Popup */}
      {showPopup && (
        <>
          {/* Overlay làm mờ nền */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
              zIndex: 9998,
            }}
            onClick={() => setShowPopup(false)}
          />

          {/* Popup box */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              border: "1px solid #007BFF",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              padding: "20px 25px",
              borderRadius: "10px",
              zIndex: 9999,
              maxWidth: "350px",
              width: "90%",
              textAlign: "center",
              animation: "popupFade 0.3s ease",
            }}
          >
            {/* Nút X */}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: "absolute",
                top: "8px",
                right: "10px",
                border: "none",
                background: "transparent",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>

            <strong>
              {t("short.become_collaborator.greeting") || "Hello!"}
            </strong>

            <p style={{ marginTop: "10px" }}>
              {t("short.become_collaborator.popup_text")}
            </p>

            <button
              onClick={handleRegisterClick}
              style={{
                marginTop: "15px",
                color: "white",
                border: "none",
                padding: "10px 18px",
                background: "#0d3c61",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              {t("short.become_collaborator.register_now")}
            </button>

            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: "15px",
                border: "1px solid #ccc",
                padding: "10px 18px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              {t("short.become_collaborator.close")}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/* ===============================
  📖 DETAIL PAGE (Restyled)
================================= */

export function DetailSuccessStory() {
  const { t, lang } = useI18n();
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
  if (error || !story)
    return <p className="error-text">{t("short.not_found_story")}</p>;

  return (
    <div>
      <section className="detail-wrapper">
        {/* Video or Image as Thumbnail */}
        <div className="detail-header">
          {story.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={story.thumbnail_url}
              controls
              className="detail-media-full"
            />
          ) : (
            <img
              src={story.thumbnail_url}
              alt={story.title}
              className="detail-media-full"
            />
          )}
        </div>

        {/* Title */}
        <h1 className="detail-main-title">
          {<TranslatableText text={story.title} lang={lang} />}
        </h1>

        {/* Content and can translate to eng or vi */}
        {/* <div className="detail-content ql-editor">
          <TranslatedHtml html={story.content} lang={lang} className="" />
          <div dangerouslySetInnerHTML={{ __html: story.content }} />
        </div> */}
        <TranslatedHtml
          html={story.content}
          lang={lang}
          isExpanded={true}
          className="detail-content ql-editor"
        />
        {/* Program Information */}
        {story.progId && (
          <div className="detail-program">
            <label>{t("admin.post.edit_form.program")}</label>
            <p>
              {story.program?.title || t("admin.post.edit_form.select_program")}
            </p>
          </div>
        )}

        {/* Event Date and Location (only for upcoming events) */}
        {story.type === "upcoming_event" && story.eventDate && (
          <div className="detail-event">
            <p>
              <strong>{t("admin.post.edit_form.location")}: </strong>
              {story.location || "N/A"}
            </p>
            <p>
              <strong>{t("admin.post.edit_form.event_date")}: </strong>
              {new Date(story.eventDate.date).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <strong>{t("admin.post.edit_form.start_time")}: </strong>
              {story.eventDate.startTime || "??:??"}
            </p>
            <p>
              <strong>{t("admin.post.edit_form.end_time")}: </strong>
              {story.eventDate.endTime || "??:??"}
            </p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

export function TipDetail() {
  const { tipId } = useParams();
  const { t, lang } = useI18n();
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
  if (error || !tip)
    return <p className="error-text">{t("short.not_found_story")}</p>;

  return (
    <div>
      <section className="detail-wrapper">
        {/* <button onClick={() => navigate(-1)} className="back-btn">
        ← {t("short.back")}
      </button> */}

        <div className="detail-header">
          {tip.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={tip.thumbnail_url}
              controls
              className="detail-media-full"
            />
          ) : (
            <img
              src={tip.thumbnail_url}
              alt={tip.title}
              className="detail-media-full"
            />
          )}
          <h1 className="detail-main-title">
            <TranslatableText text={tip.title} lang={lang} />
          </h1>
        </div>

        {/* Tip Description and translate */}
        <TranslatedHtml
          html={tip.content}
          lang={lang}
          isExpanded={true}
          className="detail-content ql-editor"
        />
        {/* <div className="detail-content ql-editor">
          <div dangerouslySetInnerHTML={{ __html: tip.content }} />
        </div> */}
      </section>
      <Footer />
    </div>
  );
}

export function EventDetail() {
  const { eventId } = useParams();
  const { t, lang } = useI18n();
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
  if (error || !event)
    return <p className="error-text">{t("short.not_found_story")}</p>;

  return (
    <div>
      <section className="detail-wrapper">
        {/* <button onClick={() => navigate(-1)} className="back-btn">
        ← {t("short.back")}
      </button> */}

        <div className="detail-header">
          {event.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={event.thumbnail_url}
              controls
              className="detail-media-full"
            />
          ) : (
            <img
              src={event.thumbnail_url}
              alt={event.title}
              className="detail-media-full"
            />
          )}
          <h1 className="detail-main-title">
            <TranslatableText text={event.title} lang={lang} />
          </h1>
          <p className="event-meta">
            📍 {t("short.event-location")}{" "}
            <TranslatableText text={event.location} lang={lang} /> | 📅{" "}
            {t("short.event-date")}
            {new Date(event.eventDate.date).toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Event Description and translated */}
        <TranslatedHtml
          html={event.content}
          lang={lang}
          isExpanded={true}
          showProgress={true}
          className="detail-content ql-editor"
        />

        {/* <div className="detail-content ql-editor">
          <div dangerouslySetInnerHTML={{ __html: event.content }} />
        </div> */}
      </section>
      <Footer />
    </div>
  );
}
