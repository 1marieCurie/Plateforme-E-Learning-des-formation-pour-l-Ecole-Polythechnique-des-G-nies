// src/components/Student/Statistics/ProgressPerChapter.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ProgressPerChapter = ({ chapters }) => {
  // Exemple de données simulées (à remplacer + tard par des données API)
  const chapterNames = chapters.map(c => c.name);
  const progressData = chapters.map(c => c.progress);

  const data = {
    labels: chapterNames,
    datasets: [
      {
        label: "Progression (%)",
        data: progressData,
        backgroundColor: "#4F46E5", // bleu indigo
        borderRadius: 5,
      },
    ],
  };

  const options = {
    indexAxis: "y", // barres horizontales
    scales: {
      x: {
        max: 100,
        ticks: {
          callback: function (val) {
            return val + "%";
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 w-full">
      <h3 className="text-lg font-semibold mb-4">Progression par chapitre</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProgressPerChapter;
