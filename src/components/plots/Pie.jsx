// components/plots/InterviewRateDonut.jsx
import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const data = [
  { name: "Interviewed", value: 35 },
  { name: "Not Interviewed", value: 65 },
];

const COLORS = ["#82ca9d", "#eee"];  // Xanh cho phần đã interview, màu xám nhẹ cho phần còn lại

export default function InterviewRateDonut() {
  const interviewRate = 35;  // dùng biến để sau này dễ chỉnh
  
  return (
    <div style={{ position: "relative", width: "300px", height: "300px", margin: "0 auto" }}>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          startAngle={90}
          endAngle={-270}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      {/* % label ở giữa */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {`${interviewRate}%`}
      </div>
    </div>
  );
}
