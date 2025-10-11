import { useLocation, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getProgrammById } from "../../api"; // giả sử bạn có api này để lấy detail theo id
import "./ProgrammsDetail.css";
import ProgrammDetail from "../Detail";
import { useI18n } from "../../i18n";

export default function ProgrammsDetail() {
  const location = useLocation();
  const { id } = useParams();

  // Nếu đã được truyền programm qua location.state thì dùng luôn
  const initialProgramm = location.state?.programm;

  const [programm, setProgramm] = useState(initialProgramm);
  const [loading, setLoading] = useState(!initialProgramm);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!programm && id) {
      setLoading(true);
      getProgrammById(id)
        .then((res) => {
          setProgramm(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load programm details");
          setLoading(false);
        });
    }
  }, [id, programm]);

  if (loading) return <p>Loading programm detail...</p>;
  const { t } = useI18n();
  if (loading) return <p>{t('pages.recruiter.loading_programms')}</p>;
  if (error) return <p style={{color: 'red'}}>{t('pages.recruiter.error_prefix')} {error}</p>;
  if (!programm) return <p>{t('detail.not_found')}</p>;

  return (
      <ProgrammDetail role="recruiter"/>
  );
}
