import React from "react";

const ProgressBar = ({ value = 0, color = "indigo", showLabel = true }) => {
  const getColorClass = () => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "gray":
        return "bg-gray-500";
      default:
        return "bg-indigo-500";
    }
  };

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColorClass()}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
      {showLabel && (
        <p className="text-sm text-right text-gray-600 mt-1">{value}%</p>
      )}
    </div>
  );
};

export default ProgressBar;
