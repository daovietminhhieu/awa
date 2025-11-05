import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { getPostById, requestASharedLink, sendFilledInformationsForm } from "../api";
import TranslateableText from "../TranslateableText";
// -------------------------------------------------
// 📌 Application Form
// -------------------------------------------------
function ApplicationForm({ to, translator }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    resumeFile: "",
    otherDocs: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await sendFilledInformationsForm(to, form);
      if (result.success) {
        alert("Application submitted successfully!");
        setForm({
          fullName: "",
          email: "",
          phone: "",
          coverLetter: "",
          resumeFile: "",
          otherDocs: [],
        });
      } else {
        alert("Submission failed: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit application form. Please try again later.");
    }
  };

  return (
    <div className="programm-sidebar">
      <h2>{translator("applyform.title")}</h2>
      <form className="apply-form" onSubmit={handleSubmit}>
        <label>{translator("applyform.name")}</label>
        <input
          type="text"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <label>{translator("applyform.phone")}</label>
        <input
          type="tel"
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
        />
        <label>{translator("applyform.cover")}</label>
        <textarea
          name="coverLetter"
          rows={4}
          value={form.coverLetter}
          onChange={handleChange}
        />
        <label>{translator("applyform.resume")}</label>
        <input
          type="text"
          name="resumeFile"
          placeholder={translator("applyform.enter_resume")}
          value={form.resumeFile}
          onChange={handleChange}
        />
        <button type="submit">{translator("applyform.submit")}</button>
      </form>
    </div>
  );
}

// -------------------------------------------------
// 📌 ProgrammTags
// -------------------------------------------------
function ProgrammTags({ tags }) {
  const handleMouse = (slider, e, type) => {
    if (type === "down") {
      slider.isDown = true;
      slider.startX = e.pageX - slider.offsetLeft;
      slider.scrollLeftStart = slider.scrollLeft;
      slider.classList.add("active");
    } else if (["leave", "up"].includes(type)) {
      slider.isDown = false;
      slider.classList.remove("active");
    } else if (type === "move" && slider.isDown) {
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = slider.scrollLeftStart - (x - slider.startX);
    }
  };

  return (
    <div
      className="programm-tags-slider"
      onMouseDown={(e) => handleMouse(e.currentTarget, e, "down")}
      onMouseLeave={(e) => handleMouse(e.currentTarget, e, "leave")}
      onMouseUp={(e) => handleMouse(e.currentTarget, e, "up")}
      onMouseMove={(e) => handleMouse(e.currentTarget, e, "move")}
    >
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="tag"
          style={{ background: tag.bg || "rgba(0,0,0,0.05)" }}
        >
          <b>{tag.label}:</b> {tag.value}
        </span>
      ))}
    </div>
  );
}

// -------------------------------------------------
// 📌 ProgrammHeader
// -------------------------------------------------
function ProgrammHeader({ programm, role, t, lang }) {
  const tags = [
    { label: t("programm.detail.overview.duration"), value: programm.duration },
    { label: t("programm.detail.overview.degrees"), value: programm.degrees },
    {
      label: t("programm.detail.overview.type_category"),
      value:
        programm.type_category === "job"
          ? t("programm.detail.overview.job")
          : t("programm.detail.overview.studium"),
    },
    { label: t("programm.detail.overview.type"), value: programm.type },
    {
      label:
        programm.type_category === "job"
          ? t("programm.detail.overview.expected_salary")
          : t("programm.detail.overview.fee"),
      value:
        programm.type_category === "job"
          ? programm.expected_salary
          : programm.fee,
    },
    {
      label: t("programm.detail.overview.status"),
      value:
        programm.completed === "true"
          ? t("programm.detail.overview.enough")
          : t("programm.detail.overview.hire"),
    },
    {
      label: t("programm.detail.overview.public_day"),
      value: new Date(programm.public_day).toLocaleDateString(),
    },
    {
      label: t("programm.detail.overview.deadline"),
      value: new Date(programm.deadline).toLocaleDateString(),
    },
  ];

  const specialTags = [];
  if ((role === "recruiter" || role === "admin") && programm.bonus)
    specialTags.push({
      label: t("programm.detail.overview.bonus"),
      value: programm.bonus,
      bg: "#ff9800",
    });
  if (programm.vacancies)
    specialTags.push({
      label: t("programm.detail.overview.vacancies"),
      value: programm.vacancies,
      bg: "#4caf50",
    });
  if (programm.hired)
    specialTags.push({
      label: t("programm.detail.overview.hired"),
      value: programm.hired,
      bg: "#4caf50",
    });

  return (
    <div className="programm-detail-header">
      <h1 className="programm-detail-title"><TranslateableText text={programm.title} lang={lang}/></h1>
      <ProgrammTags tags={tags} />
      {specialTags.length > 0 && (
        <div className="programm-tags-special">
          {specialTags.map((tag, idx) => (
            <span key={idx} className="tag" style={{ background: tag.bg }}>
              <b>{tag.label}:</b> {tag.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------
// 📌 ProgrammInfoBoxes
// -------------------------------------------------
function ProgrammInfoBoxes({ programm, currentUser, onShare, t, lang }) {
  return (
    <div className="programm-info-boxes">
      <div className="info-box">
        <b>{t("programm.detail.overview.company")}:</b>
        <p>{programm.company}</p>
      </div>
      <div className="info-box">
        <b>{t("programm.detail.overview.land")}:</b>
        <p>{programm.land}</p>
      </div>
      {currentUser?.role === "recruiter" && (
        <div className="info-box">
          <b>{t("programm.detail.overview.share_title") || "Chia sẻ chương trình"}:</b>
          <p
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={onShare}
          >
            {t("programm.detail.overview.share_action") || "Bấm để chia sẻ"}
          </p>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------
// 📌 ProgrammSection
// -------------------------------------------------
function ProgrammSection({ title, content }) {
  const safeContent = Array.isArray(content) ? content : [content];
  return (
    <section>
      <h2>{title}</h2>
      <ul>
        {safeContent.filter(Boolean).map((line, idx) => (
          <li key={idx}>
            <p>{line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// -------------------------------------------------
// 📌 Main Component
// -------------------------------------------------
export default function ProgrammOverview({ programm, role, to }) {
  const { t, lang } = useI18n();
  const { user: currentUser } = useAuth();
  const [postTitles, setPostTitles] = useState([]);

  // 👉 Hàm loại bỏ thẻ HTML
  const stripHTML = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    const fetchPostTitles = async () => {
      try {
        if (programm.details?.other?.length > 0) {
          const postIds = programm.details.other;
          const postPromises = postIds.map((postId) => getPostById(postId));
          const responses = await Promise.all(postPromises);

          const titles = responses
            .filter((response) => response.success && response.data)
            .map((response) => ({
              _id: response.data._id,
              title: response.data.title,
              excerpt:
                stripHTML(
                  response.data.excerpt || response.data.content
                ).slice(0, 100) + "...",
              thumbnail: response.data.thumbnail || response.data.coverImage || null,
              type_category: response.data.type_category || "tip",
            }));

          setPostTitles(titles);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPostTitles();
  }, [programm]);

  const handleShareReferrals = async () => {
    try {
      await requestASharedLink(programm._id);
      alert("Successfully shared this program!");
    } catch (err) {
      console.error(err);
      alert("Failed to share program.");
    }
  };

  return (
    <div>
      <ProgrammHeader programm={programm} role={role} t={t}  lang={lang}/>

      <div className="programm-main">
        <ProgrammInfoBoxes
          programm={programm}
          currentUser={currentUser}
          onShare={handleShareReferrals}
          t={t} lang={lang}
        />

        <ProgrammSection
          title={t("programm.detail.overview.overview")}
          content={[programm.details?.overview || t("programm.detail.no_description")]}
        />

        <ProgrammSection
          title={t("programm.detail.overview.requirements")}
          content={[
            <>
             🎂 {t("programm.detail.overview.age")}:{" "}
              <TranslateableText text={programm.requirement?.age} lang={lang}/>
            </>,
            
            <> 
              🎓{t("programm.detail.overview.education")}:{" "} 
              {programm.requirement?.education}
            </>,

            <>
              📜 {t("programm.detail.overview.certificate")}: 
              <TranslateableText text={programm.requirement?.certificate} lang={lang}/>
            </>,
            
            <>
              ❤️ {t("programm.detail.overview.health")}:
              <TranslateableText text={programm.requirement?.health} lang={lang}/>
            </>
          ]}
        />

        <ProgrammSection
          title={t("programm.detail.overview.benefit")}
          content={[<TranslateableText text={programm.benefit} lang={lang}/>]}
        />

        <section>
          <h2>{t("programm.detail.overview.other")}</h2>
          {postTitles.length > 0 ? (
            <div className="related-posts-list">
              {postTitles.map((post, idx) => (
                <div key={idx} className="related-post-card">
                  {post.thumbnail && (
                    <img src={post.thumbnail} alt={post.title} className="related-post-thumb" />
                  )}

                  <span className="related-post-type">{post.type_category}</span>

                  <div className="related-post-card-content">
                    <h4>{post.title}</h4>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <a
                      href={
                        post.type_category === "tip"
                          ? `/tip-detail/${post._id}`
                          : post.type_category === "event"
                          ? `/event-detail/${post._id}`
                          : post.type_category === "story"
                          ? `/success-story-detail/${post._id}`
                          : post.type_category === "partner"
                          ? `/collabor?id=${post._id}`
                          : "#"
                      }
                    >
                      {t("programm.detail.read_more") || "Read more →"}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>{t("programm.detail.no_post_found")}</p>
          )}
        </section>
      </div>

      {role === "externeCandidate" && <ApplicationForm to={to} translator={t} />}
    </div>
  );
}
