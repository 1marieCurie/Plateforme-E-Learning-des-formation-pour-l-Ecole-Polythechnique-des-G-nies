// components/Student/Statistics/CourseProgressDonut.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const CourseProgressDonut = ({ progress }) => {
  const completed = progress;
  const remaining = 100 - progress;

  const data = {
    labels: ["Terminé", "Restant"],
    datasets: [
      {
        data: [completed, remaining],
        backgroundColor: ["#4f46e5", "#e5e7eb"], // Indigo & Gris
        borderWidth: 1,
      },
    ],
  };

  const options = {
    cutout: "70%", // trou central
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Progression</h2>
      <div className="w-48 h-48 mx-auto relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-indigo-700">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default CourseProgressDonut;
