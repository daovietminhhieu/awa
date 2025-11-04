import { useLocation, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { getProgrammById } from "../../api"; // giả sử bạn có api này để lấy detail theo id
import "./ProgrammsDetail.css";
import ProgrammDetail from "../Detail";

export default function ProgrammsDetail() {
  const location = useLocation();
  const { id } = useParams();
  const { t } = useI18n();

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
  if (error) return <p style={{color: 'red'}}>{`Error: ${error}`}</p>;
  if (!programm) return <p>{t('admin.programms.no_selected') || 'No programm selected'}</p>;

  return (
      <ProgrammDetail role="admin"/>
  );
}
