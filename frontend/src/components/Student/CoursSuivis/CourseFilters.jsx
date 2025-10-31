import React from "react";

const CourseFilters = ({ categories, selectedCategory, onFilterChange }) => {
  return (
    <div className="flex mb-6 space-x-4">
      <button
        className={`p-2 px-4 rounded-lg ${!selectedCategory ? "bg-gray-300" : "bg-indigo-500 text-white"}`}
        onClick={() => onFilterChange(null)}
      >
        Tous les cours
      </button>
      {categories.map((category, index) => (
        <button
          key={index}
          className={`p-2 px-4 rounded-lg ${selectedCategory === category ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
          onClick={() => onFilterChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CourseFilters;
