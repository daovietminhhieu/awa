import React, { useEffect, useState } from "react";
import "./News.css";
import { useParams } from "react-router-dom";
import { useI18n } from "../../../i18n";
import Footer from "../../../components/footer/Footer";

import TranslatableText from "../../../i18n/TranslateableText.jsx";
import TranslatedHtml from "../../../i18n/TranslatedHtml.jsx";

import { getPostBySlug } from "../../../api.js";

export default function NewsDetail() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  if (loading) return <p className="loading-text">{t("loading")}</p>;
  if (error || !post)
    return <p className="error-text">{t("short.not_found_story")}</p>;

  const isEvent = post.type === "upcoming_event";

  return (
    <div>
      <section className="detail-wrapper">
        <NewsHeader post={post} lang={lang} t={t} />

        <TranslatedHtml
          html={post.content}
          lang={lang}
          isExpanded={true}
          showProgress={post.type === "upcoming_event"}
          className="detail-content ql-editor"
        />

        {post.progId && (
          <div className="detail-program">
            <label>{t("admin.post.edit_form.program")}</label>
            <p>{post.program?.title || t("admin.post.edit_form.select_program")}</p>
          </div>
        )}

        {isEvent && post.eventDate && (
          <EventDetails post={post} t={t} />
        )}
      </section>

    </div>
  );
}

function NewsHeader({ post, lang, t }) {
  const isVideo = post.thumbnail_url?.match(/\.(mp4|webm|ogg)$/i);
  const isEvent = post.type === "upcoming_event";
  return (
    <div className="detail-header">
      {isVideo ? (
        <video src={post.thumbnail_url} controls className="detail-media-full" />
      ) : (
        <img src={post.thumbnail_url} alt={post.title} className="detail-media-full" />
      )}
      <h1 className="detail-main-title">
        <TranslatableText text={post.title} lang={lang} />
      </h1>
      {isEvent && post.eventDate && (
        <p className="event-meta">
          📍 {t("short.event-location")} <TranslatableText text={post.location} lang={lang} />
          {" "}| {" "}📅 {t("short.event-date")} {new Date(post.eventDate.date).toLocaleDateString("vi-VN")}
        </p>
      )}
    </div>
  );
}

function EventDetails({ post, t }) {
  return (
    <div className="detail-event">
      <p>
        <strong>{t("admin.post.edit_form.location")}: </strong>
        {post.location || "N/A"}
      </p>
      <p>
        <strong>{t("admin.post.edit_form.event_date")}: </strong>
        {new Date(post.eventDate.date).toLocaleDateString("vi-VN")}
      </p>
      <p>
        <strong>{t("admin.post.edit_form.start_time")}: </strong>
        {post.eventDate.startTime}
      </p>
      <p>
        <strong>{t("admin.post.edit_form.end_time")}: </strong>
        {post.eventDate.endTime}
      </p>
    </div>
  );
}
