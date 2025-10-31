// src/components/Teacher/Etudiants/CourseSelector.jsx

import React from "react";

const CourseSelector = ({ courses, selectedCourseId, onChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Choisir un cours :
      </label>
      <select
        value={selectedCourseId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-500 text-sm"
      >
        <option value="">-- Sélectionner un cours --</option>
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
