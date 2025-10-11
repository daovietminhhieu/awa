import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useI18n } from "../../i18n";

const data = [
  { country: "USA", Tech: 120, Finance: 80, Marketing: 50 },
  { country: "Germany", Tech: 90, Finance: 60, Marketing: 30 },
  { country: "Vietnam", Tech: 70, Finance: 40, Marketing: 20 },
  { country: "Japan", Tech: 100, Finance: 50, Marketing: 25 },
];

export default function CountryIndustry() {
  const {t} = useI18n();
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",    // căn ngang giữa
        justifyContent: "center", // căn dọc giữa
        height: "100%",
        width: "100%",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        {t('admin.overview.stacked_bar_title') || 'Candidates by Country and Industry'}
      </h2>

      {/* Responsive để chart tự co khi card thay đổi */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ResponsiveContainer width="90%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Tech" stackId="a" fill="#8884d8" />
            <Bar dataKey="Finance" stackId="a" fill="#82ca9d" />
            <Bar dataKey="Marketing" stackId="a" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
