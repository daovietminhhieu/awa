import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProgrammById } from "../api";
import "./Detail.css";
import ProgrammOverview from "../components/ProgrammOverview";
import ProgrammJourney from "../components/ProgrammJourney";
import ProgrammPartner from "../components/ProgrammPartner";
import { useI18n } from "../i18n";
import Footer from "../components/Footer";

export default function ProgrammDetail({ role }) {
  const { id } = useParams();
  const [programm, setProgramm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    async function fetchProgramm() {
      try {
        const res = await getProgrammById(id);
        if (!res.success) throw new Error(t("programm.detail.not_found"));
        setProgramm(res.data);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    }
    fetchProgramm();
  }, [id]);

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
        {t("programm.detail.loading_programm")}
      </div>
    );

  return (
    <div>
      <div className="programm-map-layout">
      {/* === CỘT TRÁI: Q&A + Reviews === */}
      <aside className="programm-left-panel">
        <ProgrammPartner programm={programm} />
      </aside>

      {/* === CỘT PHẢI: Thông tin chương trình === */}
      <main className="programm-right-panel">
        <ProgrammOverview programm={programm} role={role} />
        <ProgrammJourney programm={programm} />
      </main>
      
      </div>
      <Footer/>
    </div>
  );
}
