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
import { getPostsByTypeL, getPostsListL } from "../../api";
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
        const result = await getPostsByTypeL("success_storyL");
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
      <h2 className="success-stories-title">🎓 {t("short.suc.title")}</h2>
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={3}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
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
                    onClick={() => navigate(`/news/${story.slug}`)}
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
                          className="btn btn-secondary reads-more-btn"
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
        const result = await getPostsListL();
        const list = Array.isArray(result) ? result : result?.data || [];
        console.log("Fetched featured news:", list);
        setPosts(list);
      } catch (err) {
        console.error("Error fetching featured news:", err);
      }
    })();
  }, []);
  const r = "/news-list";
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0]; // Bài lớn
  const smallPosts = posts.slice(1, 4); // 3 bài nhỏ

  return (
    <div className="featured-news-wrapper">
      <h2 className="featured-title">📰 {t("short.featured_news.title")}</h2>
      {/* {console.log(mainPost)} */}
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
            <TranslatedHtml
              html={mainPost.content}
              lang={lang}
              isExpanded={false}
              maxLength={250}
              translateCollapsed={false}
              showProgress={false}
            />
          </p>
        </div>

        {/* 3 BÀI NHỎ BÊN PHẢI */}
        <div className="featured-side-list">
          {smallPosts.map((p) => (
            <div
              key={p.id}
              className="side-item"
              onClick={() => navigate(`/news/${p.slug}`)}
            >
              <img
                src={p.thumbnail_url}
                className="side-thumb"
                loading="lazy"
                decoding="async"
                alt={p.title}
              />
              <div className="side-content">
                <h4 className="side-title">
                  <TranslatableText text={p.title} lang={lang} />
                </h4>
                <div className="side-desc">
                  <TranslatedHtml
                    html={p.content}
                    lang={lang}
                    isExpanded={false}
                    maxLength={180}
                    translateCollapsed={false}
                    showProgress={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NÚT XEM THÊM */}
      <div className="featured-btn-box">
        <button className="btn btn-primary featured-btn" onClick={() => navigate(r)}>
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

        <button onClick={handleContactClick} className="btn btn-primary partner-cta-btn">
          {t("short.partners.contact_now") || "Contact now"}
        </button>
      </div>
    </section>
  );
}

// Import file CSS của bạn ở đây
export function PartnersSlidesLogos() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const response = await getProgramsList();
      if (response.success) {
        setPrograms(response.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  if (loading || programs.length === 0) return null;

  // NHÂN BẢN: Để chạy vô tận từ phải sang trái, 
  // ta cần danh sách đủ dài để không thấy khoảng trắng ở cuối.
  const logoList = [...programs, ...programs];

  return (
    <div className="slider">
      <h1 style={{textAlign:"center",margin:"20px 40px",marginBottom:40, color:"#164e63"}}>Partners</h1>
    <div className="logo-slider-container">
      <div className="logo-slider-track">
        {logoList.map((p, i) => (
          <div className="logo-item" key={i}>
            <img src={p.progLogo} alt="Partner" loading="lazy" />
          </div>
        ))}
      </div>
      
      {/* Overlay mờ ở 2 cạnh giúp logo xuất hiện/biến mất tinh tế hơn */}
      <div className="slider-overlay-left"></div>
      <div className="slider-overlay-right"></div>
    </div></div>
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
                <div>
                  <b>{t("short.partners.detail.address_label")}</b>:{" "}
                  {t("short.partners.detail.address")}
                </div>
              </div>
              <div className="info-item">
                <div>
                  <b>{t("short.partners.detail.email_label")}:</b>{" "}
                  {t("short.partners.detail.email")}
                </div>
              </div>
              <div className="info-item">
                <div>
                  {" "}
                  <b>{t("short.partners.detail.phone_label")}</b>:{" "}
                  {t("short.partners.detail.phone")}
                </div>
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
    <div className="become-collaborator-container">
      <h2 className="section-becomecollab-title">
        {t("short.become_collaborator.title")}
      </h2>

      <p>{t("short.become_collaborator.description")}</p>

      <button onClick={handleRegisterClick} className="btn btn-primary">
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
              className="btn btn-primary"
              style={{ marginRight: "10px" }}
            >
              {t("short.become_collaborator.register_now")}
            </button>

            <button
              onClick={() => setShowPopup(false)}
              className="btn btn-secondary"
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

import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { getProgramsList } from "../../api.js";

export function TopProgramsSlider() {
  const [expandedIndex] = useState(null);
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const getShortDesc = (text, maxLength = 250) => {
    if (!text) return "";
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
  };

  // 🔹 Chọn review hiển thị: lượt đánh giá cao -> mới nhất
  const getTopReview = (reviews) => {
    if (!reviews?.length) return null;
    return [...reviews].sort((a, b) => {
      if (b.count === a.count)
        return new Date(b.createdAt) - new Date(a.createdAt);
      return b.count - a.count;
    })[0];
  };

  // 🔹 Tính toán avgRate, latestReviewDate, totalCount cho mỗi program
  const processPrograms = (programs) => {
    return programs
      .map((p) => {
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
      })
      .sort((a, b) => {
        if (b.avgRate !== a.avgRate) return b.avgRate - a.avgRate;
        if (b.latestReviewDate !== a.latestReviewDate)
          return b.latestReviewDate - a.latestReviewDate;
        return b.totalCount - a.totalCount;
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProgramsList();
        const procs = processPrograms(res.data || []);
        setPrograms(procs);
      } catch (err) {
        console.error("❌ Lỗi khi fetch:", err);
      }
    };
    fetchData();
  }, []);

  const handleClickProgram = (program) => {
    navigate(`/program/${program.slug}`, { state: { 
      programId: program.id,
      program } 
    });
  };

  return (
    <div className="top-programme-container">
      <h2 className="highlight-title">
        🎓 {t("short.top_programs.title") || "Top Programs"}
      </h2>
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={3}
        spaceBetween={30}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 16 },
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
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
                style={{ cursor: "pointer" }}
              >
                <img
                  className="top-programs-logo"
                  src={item.progLogo}
                  alt={item.name}
                  loading="lazy"
                />
                <div className="content-right">
                  <div className="title-star-row">
                    <h3 className="program-title">
                      <TranslatableText text={item.name} lang={lang} />
                    </h3>
                  </div>

                  <p className="description">
                    {expandedIndex === idx ? (
                      item.overviews
                    ) : (
                      <TranslatedHtml
                        text={getShortDesc(item.overviews)}
                        lang={lang}
                      />
                    )}
                  </p>

                  <div
                    className="stars"
                    aria-label={`Rating ${roundedRate} stars`}
                  >
                    <span className="star-icons">
                      {"★".repeat(roundedRate)}
                      {"☆".repeat(5 - roundedRate)}
                    </span>
                    <span className="review-count">
                      ({item.reviews.length}{" "}
                      {t("short.top_programs.reviews") || "đánh giá"})
                    </span>
                  </div>
                </div>

                <footer className="top-review">
                  <h4>🌟 {t("short.review_title") || "Featured Review"}</h4>
                  {topReview?.content ? (
                    <blockquote>
                      "<TranslatableText text={topReview.content} lang={lang} />
                      "
                    </blockquote>
                  ) : (
                    <p>
                      {t("short.top_programs.no_reviews") ||
                        "No reviews available."}
                    </p>
                  )}
                </footer>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
