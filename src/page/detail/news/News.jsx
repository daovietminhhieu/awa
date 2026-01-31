import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useI18n } from "../../../i18n";
import { getPostBySlug } from "../../../api.js";

// Components
import Footer from "../../../components/footer/Footer";
import TranslatableText from "../../../i18n/TranslateableText.jsx";
import TranslatedHtml from "../../../i18n/TranslatedHtml.jsx";

// Icons (Dùng Lucide-react để đồng bộ với các trang khác)
import { Calendar, MapPin, Tag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./News.css";

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Luôn cuộn lên đầu trang khi vào xem tin
    (async () => {
      try {
        const res = await getPostBySlug(slug);
        setPost(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{t("loading")}</p>
    </div>
  );

  if (error || !post) return (
    <div className="error-container">
      <p>{t("short.not_found_story")}</p>
      <button onClick={() => navigate(-1)}>{t("common.back")}</button>
    </div>
  );

  return (
    <div className="news-page-wrapper">
      <article className="news-article">
        {/* Nút quay lại nhanh */}
        <button className="back-nav-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> {t("common.back") || "Back"}
        </button>

        <NewsHeader post={post} lang={lang} t={t} />

        <div className="news-main-layout">
          <div className="news-content-area">
            <TranslatedHtml
              html={post.content}
              lang={lang}
              isExpanded={true}
              className="detail-content ql-editor"
            />
            
            {post.tags?.length > 0 && (
              <div className="tags-section">
                <Tag size={16} />
                {post.tags.map(tag => (
                  <span key={tag} className="post-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <aside className="news-sidebar-info">
            <div className="sidebar-card">
              <h3>{t("admin.post.edit_form.type") || "Category"}:</h3>
              <span className={`category-badge`}>
                {post.type?.replace('_', ' ')}
              </span>
            </div>
            
            {post.progId && post.progId.length > 0 && (
              <div className="sidebar-card">
                <h3>{t("admin.post.edit_form.program") || "Related Program"}</h3>
                <div className="related-program-box">
                   {/* Logic hiển thị link tới chương trình nếu cần */}
                   ID: {post.progId[0]}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
}

function NewsHeader({ post, lang, t }) {
  const isVideo = post.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i);
  const isEvent = post.type === "upcoming_event";

  return (
    <div className="news-header">
      <div className="media-frame">
        {/* {isVideo ? (
          <video src={post.thumbnail_url} controls autoPlay muted loop />
        ) : (
          <img src={post.thumbnail_url} alt={post.title} />
        )}
        <div className="media-overlay"></div> */}
      </div>

      <div className="header-caption">
        <div style={{height:40}}></div>
        <div style={{display:"flex", gap:20}}>

          <h1 className="post-title">
            <TranslatableText text={post.title} lang={lang} />
          </h1>
          <span className="meta-item" style={{marginTop: 20}}>
              <span style={{marginBottom:50}}>Published: {new Date(post.createdAt).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
            </span>
        </div>
        <div style={{height:40}}></div>
        <div className="post-meta-data">
          
          
          {(isEvent || post.location) && (
            <span className="meta-item">
              <MapPin size={16} />
              <TranslatableText text={post.location} lang={lang} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}