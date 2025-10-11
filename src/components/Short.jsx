import React, { useState, useEffect } from "react";

import './Short.css'
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function SuccessStories() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const videos = ["/v1.mp4", "/v1.mp4", "/v1.mp4"];
  const rawDescriptions = t("short.stories.descriptions", { returnObjects: true });
  const descriptionData = Array.isArray(rawDescriptions) ? rawDescriptions : [];

  const stories = descriptionData.map((item, idx) => ({
    id: `${idx + 1}`,
    title: item.name || `Story ${idx + 1}`,
    description: item.description || "",
    videoUrl: videos[idx % videos.length],
    imageUrl: item.image || [
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/men/65.jpg"
    ][idx % 3],
  }));

  return (
    <section className="success-stories section">
      <h2 className="section-title">
        🎓 {t("short.stories.title") || "Câu chuyện thành công"}
      </h2>

      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        loop={stories.length > 1}
        className="success-stories-swiper"
      >
        {stories.map(({ id, title, description, imageUrl, videoUrl }) => (
          <SwiperSlide key={id}>
            <article
              className="success-story-card"
              onClick={() => navigate(`/success-story-detail/${id}`, { state: { story: { id, title, description, imageUrl, videoUrl } } })}


            >
              <div className="story-left">
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="story-video"
                    poster={""}
                  />
                )}
              </div>

              <div className="story-right">
                <h3 className="story-title">{title}</h3>
                <p className="story-description">{description}</p>
                <button
                  className="story-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/success-story-detail/${id}`, {
                      state: { story: { id, title, description, imageUrl, videoUrl } },
                    });
                  }}
                >
                  {t("common.show_more") || "Xem thêm"}
                </button>
              </div>
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

  if (!story) return <p>{t('short.not_found_story')}</p>;

  return (
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
  }

  return (
    <section className="partner-sections">
      <div className="partner-content">
        <h2 className="partner-title">{t('short.partners.title')}</h2>
        <p className="partner-desc">{t('short.partners.become_collaborator_desc')}</p>
       
      </div>
      <button onClick={handleContactClick} className="partner-cta-btn">{t('short.partners.contact_now') || 'Contact now'}</button>
    </section>
  );
}

import Footer from "./Footer";
export function PartnerDetail() {
  const { t } = useI18n();
  return (
    <>
      <section className="partner-detail-section">
          <h2 className="partner-detail-title">{t('short.partners.detail.title')}</h2>
          {/**Them divider */}
          <hr className="partner-divider" />
          <div className="partner-detail-content">
            <div className="left">
              <div className="partner-detail-info">
                <div className="info-item">
                  <strong>{t('short.partners.detail.address_label')}:</strong>
                  <span>{t('short.partners.detail.address')}</span>
                </div>
                <div className="info-item">
                  <strong>{t('short.partners.detail.email_label')}:</strong>
                  <span>{t('short.partners.detail.email')}</span>
                </div>
                <div className="info-item">
                  <strong>{t('short.partners.detail.phone_label')}:</strong>
                  <span>{t('short.partners.detail.phone')}</span>
                </div>
              </div>
            </div>
            <div className="right">
              <p className="partner-goodbye">{t('short.partners.detail.goodbye')}</p>
            </div>
          </div>
        
      </section>
      <Footer />
    </>
  );
}


export function TipsAndEventsSection() {
  const navigate = useNavigate();
  const { t } = useI18n();

  // ✅ Load data từ i18n JSON
  const tips = t('short.tips', { returnObjects: true });
  const events = t('short.events_data', { returnObjects: true });

  return (
    <section className="tips-events section">
      {/* Cẩm nang nghề nghiệp */}
      <div className="tips-guide">
        <h2 className="section-title">{t('short.career_guide')}</h2>
        <div className="stories-grid">
          {tips.map(({ title, description, image }, idx) => (
            <div
              key={idx}
              className="story-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/tip-detail/${idx + 1}`)} // Giả sử route dựa vào index
            >
              <img src={image} alt={title} loading="lazy" />
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sự kiện sắp tới */}
      <div className="event-section" style={{ marginTop: "40px" }}>
        <h2 className="section-title">{t('short.events')}</h2>
        <div className="stories-grid">
          {events.map(({ title, date, location, image }, idx) => (
            <div
              key={idx}
              className="story-card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/event-detail/${idx + 1}`)} // Giả sử route dựa vào index
            >
              <img src={image} alt={title} loading="lazy" />
              <h3>{title}</h3>
              <p><strong>{t('short.event-location')}:</strong> {location}</p>
              <p><strong>{t('short.event-date')}:</strong> {date}</p>
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
      }}
    >
      <h2 className="section-title">{t('short.become_collaborator.title')}</h2>
      <p>{t('short.become_collaborator.description')}</p>
      <button
        onClick={handleRegisterClick}
        style={{
          padding: "10px 20px",
          margin: "20px 20px",
          fontSize: "16px",
          cursor: "pointer",
          color: "white",
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
          <p>{t('short.become_collaborator.popup_text') || 'Do you want to become a collaborator? Click Register now to join!'}</p>
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


