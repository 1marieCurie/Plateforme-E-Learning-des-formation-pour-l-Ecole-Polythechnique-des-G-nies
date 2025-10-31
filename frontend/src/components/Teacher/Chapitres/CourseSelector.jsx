// src/components/Teacher/Chapitres/CourseSelector.jsx

import React from "react";

const CourseSelector = ({ courses = [], selectedCourseId, onSelect, loading = false }) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2 text-sm">
        Choisir un cours :
      </label>
      <select
        value={selectedCourseId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">
          {loading ? "Chargement des cours..." : "-- Sélectionner un cours --"}
        </option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseSelector;
