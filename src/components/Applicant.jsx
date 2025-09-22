import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import {
  generateApplicants,
  getPieDataByIndustry,
  getStackedBarDataByCountryStatus,
} from "../mocks/init";


// Đăng ký Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const applicants = generateApplicants(200);

// Màu cố định cho từng trạng thái
const statusColors = {
  "Mới": "#FF6384",
  "Đang xét duyệt": "#36A2EB",
  "Phỏng vấn": "#FFCE56",
  "Trúng tuyển": "#4CAF50",
  "Xuất cảnh": "#9C27B0",
};

export default function ApplicantDashboard() {
  // Pie chart

  // Bar stacked
  const stacked = getStackedBarDataByCountryStatus(applicants);
  const barData = {
    labels: stacked.labels,
    datasets: stacked.datasets.map((ds) => ({
      ...ds,
      backgroundColor: statusColors[ds.label] || "#ccc",
    })),
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100%", 
      width: "100%" 
    }}>
      <h2 style={titleStyle}>Ứng viên theo quốc gia & trạng thái</h2>
      <div style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
      }}>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
    
  );
}
