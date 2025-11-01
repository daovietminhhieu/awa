import "./TopProgramme.css";
import { useEffect, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";
import { getProgrammsList } from "../api";
import TranslatableText from "../TranslateableText";
function TopProgrammeSlider() {
  const [expandedIndex, setExpandedIndex] = useState(null);
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
        const res = await getProgrammsList();
        const procs = processPrograms(res.data || []);
        setPrograms(procs);
      } catch (err) {
        console.error("❌ Lỗi khi fetch:", err);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (idx) =>
    setExpandedIndex(expandedIndex === idx ? null : idx);

  const handleClickProgram = (program) => {
    navigate(`/programm/${program._id}`, { state: { program } });
  };

  return (
    <section className="top-programme-section">
      <h2 className="highlight-title">
        🎓 {t("short.topprogramm.title") || "Top Programs"}
      </h2>

      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        spaceBetween={30}
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
                <div className="card-body">
                  {console.log(item)}
                  <img src={item.logoL} alt={item.title} loading="lazy" />
                  <div className="content-right">
                    <div className="title-star-row">
                      <h3 className="program-title">{item.title}</h3>
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
                          {t("short.topprogramm.reviews") || "đánh giá"})
                        </span>
                      </div>

                      <div className="reviews"></div>
                    </div>

                    <p className="description">
                      <TranslatableText
                        text={
                          expandedIndex === idx
                            ? item.details?.overview
                            : getShortDesc(item.details?.overview)
                        }
                        lang={lang}
                      />
                    </p>

                    {item.details?.overview?.length > 250 && (
                      <div className="read-more-container">
                        <button
                          className="read-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(idx);
                          }}
                        >
                          {expandedIndex === idx
                            ? t("common.hide_less")
                            : t("common.show_more")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {topReview?.content && (
                  <footer className="top-review">
                    <h4>🌟 {t("short.review_title") || "Featured Review"}</h4>
                    <blockquote>"{topReview.content}"</blockquote>
                  </footer>
                )}
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

export default TopProgrammeSlider;
