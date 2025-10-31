// src/components/Teacher/Etudiants/ProgressBar.jsx

import React from "react";

const ProgressBar = ({ value }) => {
  return (
    <div className="w-52">
      <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-right">{value}%</p>
    </div>
  );
};

export default ProgressBar;
