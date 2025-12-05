
import React, { useState, useEffect, useRef } from "react";
import "./Home.css";
// import { AutoSlider } from "../components/Slides";
// import Divider from "../components/Divider";
// import Footer from "../components/Footer";
// import partners from "../mocks/logo";
// import TopProgramme from "../components/TopProgramme";
import {
  SuccessStories,
  WhyChoose,
  Partner,
  BecomeCollaborator,
  TopProgramsSlider, FeaturedNews, PartnersSlidesLogos
} from "../short/Short";
import { useI18n } from "../../i18n/";

export default function HomePage() {
//   const [showSidebar, setShowSidebar] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useI18n();
  const [isMobile, setIsMobile] = useState(false);

  const Snowfall = () => {
    const ref = useRef(null);
    useEffect(() => {
      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      let w = window.innerWidth;
      let h = window.innerHeight;
      c.width = w;
      c.height = h;
      const flakes = Array.from({ length: 120 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, d: Math.random() * 0.8 + 0.5 }));
      let run = true;
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();
        for (const p of flakes) { ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); }
        ctx.fill();
        for (const p of flakes) { p.y += p.d * 1.5; p.x += Math.sin(p.y * 0.01) * 0.3; if (p.y > h) { p.y = -5; p.x = Math.random() * w; } }
        if (run) requestAnimationFrame(draw);
      };
      draw();
      const onResize = () => { w = window.innerWidth; h = window.innerHeight; c.width = w; c.height = h; };
      window.addEventListener("resize", onResize);
      return () => { run = false; window.removeEventListener("resize", onResize); };
    }, []);
    return <canvas ref={ref} className="snow-canvas" aria-hidden="true" />;
  };

  const ChristmasLights = () => (
    <div className="christmas-lights" aria-label={t('short.hello') || 'Hello'}>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className={`bulb b${(i % 6) + 1}`} />
      ))}
    </div>
  );

  const GiftStackSvg = () => null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.fade-section'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.06, rootMargin: '0px 0px -8% 0px' });
    els.forEach((el, idx) => {
      const d = el.getAttribute('data-fade-delay');
      const delay = d ? d : `${Math.min(idx * 0.12, 0.6)}s`;
      el.style.setProperty('--home-fade-delay', delay);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  //   useEffect(() => {
//     const handleScroll = () => {
//       const bannerHeight = document.querySelector(".home-banner")?.offsetHeight || 0;
//       setShowSidebar(window.scrollY > bannerHeight);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

  return (
    <div 
      className="home-wrapper"
      
    >
      <Snowfall />
      {!isMobile && <ChristmasLights />}
      {/* gift removed */}
      {/* Submenu removed */}

      {/* Banner */}

      {/* Nút mở sidebar
      {showSidebar && (
        <button
          className="home-sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ " : "☰ "}
        </button>
      )} */}

      {/* Sidebar
      <aside className={`home-sidebar ${sidebarOpen ? "show" : ""}`}>
        <div>{t('short.hello')}</div>
        {/* <Divider /> */}
        {/* <ul>
          <li><a href="#top-programme">{t('short.topprogramme')}</a></li>
          <li><a href="#why-choose">{t('short.why')}</a></li>
          <li><a href="#success-stories">{t('short.suc')}</a></li>
          <li><a href="#tips-events">{t('short.tae')}</a></li>
          <li><a href="#partners">{t('short.prts')}</a></li>
          <li><a href="#become-collaborator">{t('short.bop')}</a></li>
        </ul>
      </aside>  */}

      {/* Nội dung trang */}
      <div 
        className="home-page-container"
      >
        
        <main>
          <section id="top-programme" className="fade-section">
            <TopProgramsSlider /> 
          </section>

          <section id="why-choose" className="fade-section">
            <WhyChoose />
          </section>

            

          <section id="success-stories" className="fade-section">
            <SuccessStories /> 
          </section>


          <section className="fade-section">
            <FeaturedNews />
          </section>

          <section id="partners" className="fade-section">
            <Partner />
            {/* <AutoSlider logos={partners} />  */}
          </section>

          <section>
            <PartnersSlidesLogos />
          </section>

          <section id="become-collaborator" className="fade-section">
            <BecomeCollaborator /> 
          </section>
        </main>
      </div>

    </div>
  );
}
