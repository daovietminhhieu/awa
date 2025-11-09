import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./Slides.css";

export function NewsSlider({ news }) {
  return (
    <div className="news-slider">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        navigation
        loop
        breakpoints={{
          0: { slidesPerView: 1 },     // Mobile: chỉ 1 slide
          640: { slidesPerView: 2 },   // Tablet nhỏ: 2 slide
          1024: { slidesPerView: 3 },  // Desktop: 3 slide
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

"use client";

import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { useI18n } from "../i18n";

export function AutoSlider({ logos }) {
    const {t} = useI18n();  


    return (
      <section className="partner-section">
        <div>
          <h1 className="partner-title" >{t('short.partner.title')}</h1>
        </div>
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
                  {/* <button>Delete</button> */}
                </div>
              </SwiperSlide>
              
            ))}
            {/* <button style={{marginTop:30}}>Add more picture</button> */}
          </Swiper>
        </div>
      </section>
    );
  }
