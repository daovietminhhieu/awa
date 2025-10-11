import React from "react";
import { useI18n } from "../i18n";

export default function ProgrammJourney({ programm }) {
  const { t } = useI18n();

  return (
    <div className="journey-detail">
      <h1>{t("programm.detail.journey.title")}</h1>

      {/* === GIAI ĐOẠN ĐÀO TẠO === */}
      <section>
        <h3>{t("programm.detail.journey.training_phase")}</h3>
        <ol>
          {Object.keys(t("programm.detail.journey.steps")).map((key) => (
            <li key={key}>{t(`programm.detail.journey.steps.${key}`)}</li>
          ))}
        </ol>
      </section>

      {/* === BẢNG CHI PHÍ === */}
      <section>
        <h3>{t("programm.detail.journey.cost_table_title")}</h3>
        <table className="cost-table">
          <thead>
            <tr>
              <th>{t("programm.detail.journey.costs.header_item") || "Khoản mục"}</th>
              <th>{t("programm.detail.journey.costs.header_note") || "Ghi chú"}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(t("programm.detail.journey.costs")).map(([key, value]) => {
              if (key === "note") return null; // skip note object
              return (
                <tr key={key}>
                  <td>{value}</td>
                  <td>{t(`programm.detail.journey.costs.note.${key}`)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: "10px", fontStyle: "italic" }}>
          {t("programm.detail.journey.no_extra_costs")}
        </p>
      </section>

      {/* === HỒ SƠ CẦN CHUẨN BỊ === */}
      <section>
        <h3>{t("programm.detail.journey.documents_title")}</h3>
        <ul>
          {Object.keys(t("programm.detail.journey.documents")).map((key) => (
            <li key={key}>{t(`programm.detail.journey.documents.${key}`)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
