// components/Student/Statistics/ProgressHistoryChart.jsx
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Enregistrement des éléments du graphique
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const ProgressHistoryChart = ({ progressHistory = [] }) => {
  // Si progressHistory est vide, tu peux fournir des valeurs par défaut
  if (progressHistory.length === 0) {
    progressHistory = [
      { date: "2025-01-01", progress: 20 },
      { date: "2025-02-01", progress: 40 },
      { date: "2025-03-01", progress: 60 },
      { date: "2025-04-01", progress: 80 },
      { date: "2025-05-01", progress: 100 },
    ]; // Remplace par tes propres valeurs par défaut
  }

  const labels = progressHistory.map(entry => entry.date);
  const dataPoints = progressHistory.map(entry => entry.progress);

  const data = {
    labels,
    datasets: [
      {
        label: "Progression (%)",
        data: dataPoints,
        fill: false,
        borderColor: "#4f46e5", // indigo
        backgroundColor: "#6366f1",
        tension: 0.3, // courbure des lignes
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: value => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historique de progression</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default ProgressHistoryChart;
