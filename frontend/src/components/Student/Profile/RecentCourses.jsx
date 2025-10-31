// src/components/Student/Profile/RecentCourses.jsx
import React from "react";
import CourseCard from "@/components/Student/CoursSuivis/CourseCard";

const RecentCourses = ({ recentCourses }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Cours récemment consultés</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentCourses.map((course, idx) => (
          <CourseCard key={idx} course={course} />
        ))}
      </div>
    </div>
  );
};

export default RecentCourses;
