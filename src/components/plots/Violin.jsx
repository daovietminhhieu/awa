import React from "react";
import Plot from "react-plotly.js";

const ViolinPlot = () => {
  // Giả dữ liệu
  const smokerFalse = [120, 130, 125, 140, 135, 150, 110, 145, 138, 132];
  const smokerTrue = [100, 95, 110, 120, 105, 115, 90, 85, 112, 98];

  return (
    <div className="p-6">
      <Plot
        data={[
          {
            y: smokerFalse,
            type: "violin",
            name: "False",
            box: { visible: true },     // hiển thị boxplot bên trong
            line: { color: "steelblue" },
            meanline: { visible: true }, // hiển thị đường mean
          },
          {
            y: smokerTrue,
            type: "violin",
            name: "True",
            box: { visible: true },
            line: { color: "orange" },
            meanline: { visible: true },
          },
        ]}
        layout={{
          title: "Violin Plot - Birth Weight vs Maternal Smoker",
          yaxis: { title: "Birth Weight" },
          xaxis: { title: "Maternal Smoker" },
          violingap: 0.5, // khoảng cách giữa các violin
          violinmode: "overlay", // có thể đổi sang "group" nếu muốn đặt cạnh nhau
        }}
        style={{ width: "100%", height: "500px" }}
      />
    </div>
  );
};

export default ViolinPlot;
