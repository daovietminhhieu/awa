import React, { useState, useEffect, useRef } from "react";
import "./Home.css";
import {
  SuccessStories,
  WhyChoose,
  Partner,
  BecomeCollaborator,
  TopProgramsSlider,
  FeaturedNews,
  PartnersSlidesLogos,
} from "../short/Short";

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);

  /* ===============================
     ❄️ Snowfall (desktop only)
  ================================ */
  const Snowfall = () => {
    const ref = useRef(null);

    useEffect(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (window.innerWidth <= 768 || prefersReducedMotion) return;

      const c = ref.current;
      if (!c) return;
      const ctx = c.getContext("2d");

      let w = window.innerWidth;
      let h = window.innerHeight;
      c.width = w;
      c.height = h;

      const flakes = Array.from({ length: 100 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + 1,
        d: Math.random() * 0.8 + 0.5,
      }));

      let run = true;

      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath();

        for (const p of flakes) {
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        }
        ctx.fill();

        for (const p of flakes) {
          p.y += p.d * 1.5;
          if (p.y > h) {
            p.y = -5;
            p.x = Math.random() * w;
          }
        }

        if (run) requestAnimationFrame(draw);
      };

      const handleVisibility = () => {
        if (document.hidden) {
          run = false;
        } else {
          run = true;
          requestAnimationFrame(draw);
        }
      };

      draw();
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        run = false;
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }, []);

    return <canvas ref={ref} className="snow-canvas" aria-hidden />;
  };

  /* ===============================
     📱 Detect mobile
  ================================ */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ===============================
     ✨ Fade-in observer (DESKTOP)
  ================================ */
  useEffect(() => {
    if (isMobile) return; // 🔥 mobile: hiện luôn

    const sections = document.querySelectorAll(".fade-section");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [isMobile]);

  return (
    <div className="home-wrapper">
      {!isMobile && <Snowfall />}

      <div className="home-page-container">
        <main>
          <div className="home-inner">
            <section className="fade-section">
              <TopProgramsSlider />
            </section>

            <section className="fade-section">
              <WhyChoose />
            </section>

            <section className="fade-section">
              <SuccessStories />
            </section>

            <section className="fade-section">
              <FeaturedNews />
            </section>

            <section>
              <PartnersSlidesLogos />
            </section>

            <section className="fade-section">
              <Partner />
            </section>
            {/* <section className="fade-section">
              <BecomeCollaborator />
            </section> */}
          </div>
        </main>
      </div>
    </div>
  );
}
