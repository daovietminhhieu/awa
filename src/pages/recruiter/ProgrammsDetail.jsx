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

  const [programm, setProgramm] = useState(initialProgramm || null);  // đảm bảo programm luôn là null nếu không có giá trị ban đầu
  const [loading, setLoading] = useState(!initialProgramm);  // loading bắt đầu là true nếu chưa có programm
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
  }, [id, programm]);  // Chỉ chạy khi id hoặc programm thay đổi

  // Không cần kiểm tra loading nữa ở đây, đã có ở trên rồi
  if (loading) return <p>{t('admin.programms.loading') || 'Loading programm detail...'}</p>;
  if (error) return <p style={{ color: "red" }}>{`Error: ${error}`}</p>;
  if (!programm) return <p>{t('admin.programms.no_selected') || 'No programm selected'}</p>;

  // Render detail sau khi đã có programm
  return <ProgrammDetail role="admin" programm={programm} />;
}
