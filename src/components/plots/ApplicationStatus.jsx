// components/plots/ApplicationStatus.js
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const data = [
  { status: "Submitted", count: 120 },
  { status: "In Review", count: 80 },
  { status: "Interview", count: 40 },
  { status: "Offer", count: 15 },
  { status: "Hired", count: 10 },
  { status: "Rejected", count: 60 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c", "#ff8042"];

export default function ApplicationStatus() {
  return (
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 40 }}>
      {/* Bar chart */}
      <BarChart width={400} height={300} data={data}>
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>

      {/* Pie chart */}
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip />
      </PieChart>
    </div>
  );
}
