import React, { useState, useEffect } from "react";
import "./Home.css";
import { AutoSlider } from "../components/Slides";
import Divider from "../components/Divider";
import Footer from "../components/Footer";
import partners from "../mocks/logo";
import TopProgramme from "../components/TopProgramme";
import {
  SuccessStories,
  WhyChoose,
  Partner,
  TipsAndEventsSection,
  BecomeCollaborator,
} from "../components/Short";
import { useI18n } from "../i18n";

export default function HomePage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {t, lang} = useI18n();
  useEffect(() => {
    const handleScroll = () => {
      const bannerHeight = document.querySelector(".home-banner")?.offsetHeight || 0;
      setShowSidebar(window.scrollY > bannerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <div className="home-wrapper">
      {/* Submenu cố định */}
      <div className="home-navmenu-container">
        <div className="home-sub-navmenu">
          <a href="#top-programme">{t('short.topprogramme')}</a>
          <a href="#why-choose">{t('short.why')}</a>
          <a href="#success-stories">{t('short.suc')}</a>
          <a href="#tips-events">{t('short.tae')}</a>
          <a href="#partners">{t('short.prts')}</a>
          <a href="#become-collaborator">{t('short.bop')}</a>
        </div>

  
      </div>

      {/* Banner */}
      <div className="home-banner"></div>

      {/* Nút mở sidebar */}
      {showSidebar && (
        <button
          className="home-sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ " : "☰ "}
        </button>
      )}

      {/* Sidebar */}
      <aside className={`home-sidebar ${sidebarOpen ? "show" : ""}`}>
        <div>Navbar</div>
        <Divider />
        <ul>
          <li><a href="#top-programme">{t('short.topprogramme')}</a></li>
          <li><a href="#why-choose">{t('short.why')}</a></li>
          <li><a href="#success-stories">{t('short.suc')}</a></li>
          <li><a href="#tips-events">{t('short.tae')}</a></li>
          <li><a href="#partners">{t('short.prts')}</a></li>
          <li><a href="#become-collaborator">{t('short.bop')}</a></li>
        </ul>
      </aside>

      {/* Nội dung trang */}
      <div className="home-page-container">
        <main>
          <section id="top-programme">
            <TopProgramme />
          </section>

          <section id="why-choose">
            <WhyChoose />
          </section>

          <section id="divider">
            <Divider />
          </section>

          <section id="success-stories">
            <SuccessStories />
          </section>

          <section id="tips-events">
            <TipsAndEventsSection />
          </section>

          <section id="partners">
            <Partner />
            <AutoSlider logos={partners} />
          </section>

          <section id="become-collaborator">
            <BecomeCollaborator />
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
