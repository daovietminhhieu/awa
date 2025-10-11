import './TopProgramme.css';
import { useEffect, useState } from 'react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { useI18n } from '../i18n';

function TopProgrammeSlider({ programs }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [topProgrammsList, setTopProgrammsList] = useState([]);

  // ✅ Dịch đa ngôn ngữ
  const { t } = useI18n();

  // ✅ Lấy dữ liệu từ i18n JSON (returnObjects:true để lấy array)
  const topPrograms = t('short.topprogramm.list', { returnObjects: true });

  // ✅ Hàm rút gọn mô tả
  const getShortDesc = (text, maxLength = 250) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  };

  // ✅ Khi mount, nạp dữ liệu (từ props hoặc i18n)
  useEffect(() => {
    if (programs && programs.length > 0) {
      setTopProgrammsList(programs);
    } else {
      setTopProgrammsList(topPrograms);
    }
  }, [programs, topPrograms]);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section className="top-programme-section">
      <h2 className="highlight-title">🎓 {t('short.topprogramm.title') || 'Top Programs'}</h2>

      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        spaceBetween={30}
        loop
        autoplay={{
          delay: 10000,
          disableOnInteraction: false,
        }}
        navigation={false}
        breakpoints={{
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
        }}
      >
        {topProgrammsList.map((item, idx) => (
          <SwiperSlide key={idx}>
            <article className="featured-card">
              <div className="card-body">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="content-right">
                  <div className="title-star-row">
                    <h3 className="program-title">{item.title}</h3>
                    <div className="stars" aria-label={`Rating ${item.rate} stars`}>
                      {'★'.repeat(item.rate)}
                      {'☆'.repeat(5 - item.rate)}
                    </div>
                  </div>

                  <p className="description">
                    {expandedIndex === idx
                      ? item.description
                      : getShortDesc(item.description)}
                  </p>

                  {item.description.length > 250 && (
                    <div className="read-more-container">
                      <button
                        className="read-more-btn"
                        onClick={() => toggleExpand(idx)}
                      >
                        {expandedIndex === idx ? 'Hide' : 'Read more'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {item.review && (
                <footer className="top-review">
                  <h4>🌟 {t('short.review_title') || 'Featured Review'}</h4>
                  <blockquote>"{item.review}"</blockquote>
                </footer>
              )}
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

// ✅ Component chính
export default function TopProgramme() {
  const { t } = useI18n();
  const programs = t('short.topprogramm', { returnObjects: true });
  return <TopProgrammeSlider programs={programs} />;
}
