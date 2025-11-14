import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./Slides.css";
import { useI18n } from "../i18n";

export function NewsSlider({ news }) {
  return (
    <div className="news-slider">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        navigation
        loop
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {news.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="news-card">
              <img src={item.image} alt={item.title} className="news-image" />
              <div className="news-content">
                <p className="news-date">{item.date}</p>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-desc">{item.description}</p>
                <a href={item.link} className="news-link">Xem thêm →</a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export function AutoSlider({ logos }) {
  const { t } = useI18n();

  return (
    <section className="partner-section">
      <h1 className="partner-title">{t('short.partner.title')}</h1>
      <div className="partner-container">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={5}
          spaceBetween={40}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={3000}
          freeMode={true}
        >
          {logos.map((logo, idx) => (
            <SwiperSlide key={idx} className="partner-slide">
              <div className="partner-card">
                <img src={logo} alt={`Partner ${idx}`} className="partner-logo" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
