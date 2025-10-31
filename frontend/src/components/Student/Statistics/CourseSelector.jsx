// src/components/Student/Statistics/CourseSelector.jsx
import React from "react";

// courses: tableau [{id, title, ...}] ou similaire
const CourseSelector = ({ selected, onChange, courses = [] }) => {
  const hasCourses = Array.isArray(courses) && courses.length > 0;
  return (
    <div className="max-w-sm">
      <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">
        Choisissez un cours :
      </label>
      <select
        id="course-select"
        value={selected && selected.id ? selected.id : ''}
        onChange={e => {
          const course = courses.find(c => String(c.id) === e.target.value);
          onChange(course || null);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={!hasCourses}
      >
        <option value="">{hasCourses ? '-- Sélectionner --' : 'Aucun cours disponible'}</option>
        {hasCourses && courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseSelector;
