import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProgrammBySlug } from "../api"; // Import hàm mới
import "./Detail.css";
import ProgrammOverview from "../components/ProgrammOverview";
import ProgrammJourney from "../components/ProgrammJourney";
import ProgrammPartner from "../components/ProgrammPartner";
import { useI18n } from "../i18n";
import Footer from "../components/Footer";

export default function ProgrammDetail({ role }) {
  const { slug } = useParams(); // Đổi từ id thành slug
  const [programm, setProgramm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    async function fetchProgramm() {
      try {
        if (!slug) {
          throw new Error(t("programm.detail.slug_required"));
        }
        
        const res = await getProgrammBySlug(slug); // Sử dụng hàm mới
        if (!res.success) throw new Error(t("programm.detail.not_found"));
        setProgramm(res.data);
      } catch (err) {
        console.error("Error fetching programm:", err);
        setError(err.message || "Có lỗi xảy ra khi tải thông tin chương trình");
      } finally {
        setLoading(false);
      }
    }
    fetchProgramm();
  }, [slug, t]);

  if (loading)
    return (
      <div className="programm-loading">
        {t("programm.detail.loading_programm")}
      </div>
    );

  if (error)
    return (
      <div className="programm-loading" style={{ color: "red" }}>
        ❌ {error}
      </div>
    );

  if (!programm)
    return (
      <div className="programm-loading">
        {t("programm.detail.programm_not_found")}
      </div>
    );

  return (
    <div>
      <div className="programm-map-layout">
        {/* === CỘT TRÁI: Q&A + Reviews === */}
        <aside className="programm-left-panel">
          <ProgrammPartner programm={programm} currentUser={role}/>
        </aside>

        {/* === CỘT PHẢI: Thông tin chương trình === */}
        <main className="programm-right-panel">
          <ProgrammOverview programm={programm} role={role} />
          <ProgrammJourney program={programm} />
        </main>
      </div>
      <Footer/>
    </div>
  );
}