import { useLocation, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { getProgrammBySlug } from "../../api"; // Đổi thành hàm lấy theo slug
import "./ProgrammsDetail.css";
import ProgrammDetail from "../Detail";

export default function ProgrammsDetail() {
  const location = useLocation();
  const { slug } = useParams(); // Đổi từ id thành slug
  const { t } = useI18n();

  // Nếu đã được truyền programm qua location.state thì dùng luôn
  const initialProgramm = location.state?.programm;

  const [programm, setProgramm] = useState(initialProgramm);
  const [loading, setLoading] = useState(!initialProgramm);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!programm && slug) {
      setLoading(true);
      getProgrammBySlug(slug) // Đổi thành hàm lấy theo slug
        .then((res) => {
          if (res.success) {
            setProgramm(res.data);
          } else {
            throw new Error(res.message || "Failed to load programm details");
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load programm details");
          setLoading(false);
        });
    }
  }, [slug, programm]); // Đổi từ id thành slug

  if (loading) return <p>Loading programm detail...</p>;
  if (error) return <p style={{color: 'red'}}>{`Error: ${error}`}</p>;
  if (!programm) return <p>{t('admin.programms.no_selected') || 'No programm selected'}</p>;

  return (
      <ProgrammDetail role="recruiter"/>
  );
}