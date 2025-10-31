// src/components/Teacher/Formations/CourseListInFormation.jsx

import React from "react";
import { BsBook } from "react-icons/bs";

const CourseListInFormation = ({ courses }) => {
  return (
    <div className="border-t pt-3 space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Cours dans cette formation :</h4>
      <ul className="space-y-1 pl-2">
        {courses.map((course) => (
          <li
            key={course.id}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <BsBook className="text-indigo-500" />
            <span>{course.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseListInFormation;
