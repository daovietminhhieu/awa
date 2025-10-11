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

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const applicants = generateApplicants(200);

// Fixed colors for each status
const statusColors = {
  "New": "#FF6384",
  "Under Review": "#36A2EB",
  "Interviewing": "#FFCE56",
  "Hired": "#4CAF50",
  "Deployed": "#9C27B0",
};

export default function ApplicantDashboard() {
  // Bar stacked data
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
      <h2 style={titleStyle}>Applicants by Country & Status</h2>
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
