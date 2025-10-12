import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProgrammById } from "../api";
import "./Detail.css";
import ProgrammOverview from "../components/ProgrammOverview";
import ProgrammJourney from "../components/ProgrammJourney";
import ProgrammPartner from "../components/ProgrammPartner";
import { useI18n } from "../i18n";

export default function ProgrammDetail({role}) {
  const { id } = useParams();
  const [programm, setProgramm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useI18n();
  useEffect(() => {
    async function fetchProgramm() {
      try {
        const res = await getProgrammById(id);
        if (!res.success) throw new Error(t('programm.detail.not_found'));
        setProgramm(res.data);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    }

    fetchProgramm();
  }, [id]);

  if (loading) return <p>{t('programm.detail.loading_programm')}</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;
  if (!programm) return <p>{t('programm.detail.not_found')}</p>;

  return (
      <div className="programm-detail column-layout">
        <ProgrammOverview programm={programm} role={role} />
        <ProgrammJourney programm={programm} />
        <ProgrammPartner programm={programm} />
      </div>
  );
}
