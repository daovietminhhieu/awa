import React, { useState, useEffect } from "react";

import "./Short.css";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import "react-quill-new/dist/quill.snow.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import TranslatableText from "../../i18n/TranslateableText.jsx";
import TranslatedHtml from "../../i18n/TranslatedHtml.jsx";
import { getPostsByType, getPostsList } from "../../api";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext.jsx";



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
    <div className="success-stories-container">
      <h2 className="success-stories-title">
           🎓 {t("short.suc.title")}

      </h2>
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={3}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 30 }
        }}
        pagination={{ clickable: true }}
        navigation
        loop={stories.length > 1}
        className="success-stories-swiper"
      >
        {stories.map((story) => (
          <SwiperSlide key={story._id}>
            <article className="success-story-card">
              <div
                className="success-stories-content"
                onClick={() => navigate(`/news/${story.slug}`)}
              >
                <div
                  className="story-left"
                  onClick={() => navigate(`/news/${story.slug}`)}
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
                      navigate(`/news/${story.slug}`)
                    }
                  >
                    <TranslatableText text={story.title} lang={lang} />
                  </h3>

                  <div className="story-content">
                    {/* Dịch nội dung HTML */}
                    <TranslatedHtml
                      html={story.content}
                      lang={lang}
                      isExpanded={false} // Quan trọng: chỉ dịch khi expanded
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
                            navigate(`/news/${story.slug}`);
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
    </div>
  );
}

export function FeaturedNews() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const result = await getPostsList();
        const list = Array.isArray(result) ? result : (result?.data || []);
        setPosts(list);
      } catch (err) {
        console.error("Error fetching featured news:", err);
      }
    })();
  }, []);
  const r="/news-list";
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];        // Bài lớn
  const smallPosts = posts.slice(1, 4); // 3 bài nhỏ

  return (
    <div className="featured-news-wrapper">
      <h2 className="featured-title">📰 {t("short.featured_news.title")}</h2>
      {console.log(mainPost)}
      <div className="featured-grid">
        {/* BÀI LỚN TRÁI */}
        <div
          className="featured-main"
          onClick={() => navigate(`/news/${mainPost.slug}`)}
        >
          <img
            src={mainPost.thumbnail_url}
            alt={mainPost.title}
            className="featured-main-img"
            loading="lazy"
            decoding="async"
          />

          <h3 className="main-title">
            <TranslatableText text={mainPost.title} lang={lang} />
          </h3>

          <p className="main-desc">
            <TranslatedHtml html={mainPost.content} lang={lang} isExpanded={false} maxLength={250} translateCollapsed={false} showProgress={false} />
          </p>
        </div>

        {/* 3 BÀI NHỎ BÊN PHẢI */}
        <div className="featured-side-list">
          {smallPosts.map((p) => (
            <div
              key={p._id}
              className="side-item"
              onClick={() => navigate(`/news/${p.slug}`)}
            >
              <img src={p.thumbnail_url} className="side-thumb" loading="lazy" decoding="async" alt={p.title} />
              <div className="side-content">
                <h4 className="side-title">
                  <TranslatableText text={p.title} lang={lang} />
                </h4>
                <div className="side-desc">
                  <TranslatedHtml html={p.content} lang={lang} isExpanded={false} maxLength={180} translateCollapsed={false} showProgress={false} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NÚT XEM THÊM */}
      <div className="featured-btn-box">
        <button
          className="featured-btn"
          onClick={() => navigate(r)}
        >
          {t("short.button.more")}
        </button>
      </div>
    </div>
  );
}


export function WhyChoose() {
  const { t } = useI18n();
  const reasonData = t("short.why_choose.reasons", { returnObjects: true });

  // Nếu reasonData không phải là mảng, gán mảng rỗng để tránh lỗi
  const reasons = Array.isArray(reasonData)
    ? reasonData.map((reason) => ({
        ...reason,
      }))
    : [];

  return (
    <div className="why-choose-container">
      <h2 className="why-choose-title">
        {t("short.why_choose.title") || "Why choose Alowork.com?"}
      </h2>
      <div className="reasons-grid">
        {reasons.map(({ title, description }, idx) => (
          <div key={idx} className="reason-card">
            <div className="reason-content">
              <h3 className="reason-title">{title}</h3>
              <p className="reason-desc">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
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

export function PartnersSlidesLogos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const bucket = "alowork-partner";

  const {user} = useAuth();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.storage.from(bucket).list("", {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) {
        console.warn("Load logos error:", error.message);
        setItems([]);
      } else {
        const mapped = (data || []).map((f) => ({
          name: f.name,
          url: supabase.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
        }));
        setItems(mapped);
      }
      setLoading(false);
    })();
  }, []);

  const onAdd = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const key = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from(bucket).upload(key, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const url = supabase.storage.from(bucket).getPublicUrl(key).data.publicUrl;
      setItems((prev) => [...prev, { name: key, url }]);
    } catch (e) {
      alert("Upload failed: " + (e?.message || e));
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async (name) => {
    const ok = window.confirm("Remove this logo?");
    if (!ok) return;
    const { error } = await supabase.storage.from(bucket).remove([name]);
    if (error) {
      alert("Remove failed: " + error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.name !== name));
  };

  const AddTile = () => (
    <label className="logo-card add-tile" title="Add logo">
      <input
        type="file"
        accept="image/*"
        className="hidden-file"
        onChange={(e) => onAdd(e.target.files?.[0])}
        disabled={uploading}
      />
      <span className="plus">+</span>
      <span className="add-text">Add logo</span>
    </label>
  );

  if (loading) return <div className="partner-logos-wrapper">Loading...</div>;

  if (!items.length) {
    return (
      <div className="partner-logos-wrapper empty">
        <AddTile />
      </div>
    );
  }

  return (
    <div className="partner-logos-wrapper">
      <div className="partner-logos-marquee" style={{ "--partner-speed": "10s" }}>
        <div className="logos-track">
          {items.map((it) => (
            <div key={"a-" + it.name} className="logo-card">
              <img src={it.url} alt={it.name} className="logo-img" loading="lazy" />
              {user?.role === "admin" && (
                <button className="logo-remove" onClick={() => onRemove(it.name)} title="Remove">×</button>
              )}
            </div>
          ))}
          {items.map((it) => (
            <div key={"b-" + it.name} className="logo-card">
              <img src={it.url} alt={it.name} className="logo-img" loading="lazy" />
              {user?.role === "admin" && (
                <button className="logo-remove" onClick={() => onRemove(it.name)} title="Remove">×</button>
              )}
            </div>
          ))}
          {user?.role === "admin" && <AddTile />}
        </div>
      </div>
    </div>
  );
}

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
                <div><b>{t("short.partners.detail.address_label")}</b>: {t("short.partners.detail.address")}</div>
               
              </div>
              <div className="info-item">
                <div><b>{t("short.partners.detail.email_label")}:</b> {t("short.partners.detail.email")}</div>
              </div>
              <div className="info-item">
               <div> <b>{t("short.partners.detail.phone_label")}</b>: {t("short.partners.detail.phone")}</div>
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
    <div
      className="become-collaborator-container"
      style={{
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
    </div>
  );
}

/* ===============================
  📖 DETAIL PAGE (Restyled)
================================= */



import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { getProgrammsList } from '../../api.js';

export function TopProgramsSlider() {
  const [expandedIndex] = useState(null);
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();
  const { t,lang } = useI18n();

  const getShortDesc = (text, maxLength = 250) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  };

  // 🔹 Chọn review hiển thị: lượt đánh giá cao -> mới nhất
  const getTopReview = (reviews) => {
    if (!reviews?.length) return null;
    return [...reviews].sort((a, b) => {
      if (b.count === a.count) return new Date(b.createdAt) - new Date(a.createdAt);
      return b.count - a.count;
    })[0];
  };

  // 🔹 Tính toán avgRate, latestReviewDate, totalCount cho mỗi program
  const processPrograms = (programs) => {
    return programs.map((p) => {
      const reviews = p.reviews || [];
      const avgRate = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length
        : 0;
      const latestReviewDate = reviews.length
        ? Math.max(...reviews.map((r) => new Date(r.createdAt).getTime()))
        : 0;
      const totalCount = reviews.length
        ? reviews.reduce((sum, r) => sum + r.count, 0)
        : 0;
      return { ...p, avgRate, latestReviewDate, totalCount };
    }).sort((a, b) => {
      if (b.avgRate !== a.avgRate) return b.avgRate - a.avgRate;
      if (b.latestReviewDate !== a.latestReviewDate) return b.latestReviewDate - a.latestReviewDate;
      return b.totalCount - a.totalCount;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProgrammsList();
        const procs = processPrograms(res.data || []);
        setPrograms(procs);
      } catch (err) {
        console.error('❌ Lỗi khi fetch:', err);
      }
    };
    fetchData();
  }, []);


  const handleClickProgram = (program) => {
    navigate(`/programm/${program.slug}`, { state: { program } });
  };

  return (
    <div className="top-programme-container">
      <h2 className="highlight-title">🎓 {t('short.top_programs.title') || 'Top Programs'}</h2>
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={3}
        spaceBetween={30}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 30 }
        }}
        loop
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        navigation={false}
      >
        {programs.map((item, idx) => {
          const topReview = getTopReview(item.reviews);
          const roundedRate = Math.round(item.avgRate);

          return (
            <SwiperSlide key={idx}>
              <article
                className="featured-card"
                onClick={() => handleClickProgram(item)}
                style={{ cursor: 'pointer' }}
              >
                  <img className="top-programs-logo" src={item.logoL} alt={item.title} loading="lazy" />
                  <div className="content-right">
                    <div className="title-star-row">
                      <h3 className="program-title"><TranslatableText text={item.title} lang={lang}/></h3>
                    
                    </div>

                    <p className="description">
                      {expandedIndex === idx
                        ? item.details?.overview
                        : <TranslatableText text={getShortDesc(item.details?.overview)} lang={lang}/> }
                    </p>

                    
                    <div className="stars" aria-label={`Rating ${roundedRate} stars`}>
                        <span className="star-icons">
                          {'★'.repeat(roundedRate)}
                          {'☆'.repeat(5 - roundedRate)}
                        </span>
                        <span className="review-count">
                          ({item.reviews.length} {t('short.top_programs.reviews') || 'đánh giá'})
                        </span>
                      </div>
                  </div>

                  <footer className="top-review">
                    <h4>🌟 {t('short.review_title') || 'Featured Review'}</h4>
                    {topReview?.content? <blockquote>"<TranslatableText text={topReview.content} lang={lang}/>"</blockquote>
                    : <p>{t('short.top_programs.no_reviews') || 'No reviews available.'}</p>}
                    </footer>
                
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

