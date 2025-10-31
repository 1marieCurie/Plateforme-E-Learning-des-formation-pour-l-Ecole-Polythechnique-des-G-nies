// src/components/Teacher/Etudiants/StudentCard.jsx

import React from "react";
import ProgressBar from "./ProgressBar";
import { FiDownload, FiMessageSquare } from "react-icons/fi";

const StudentCard = ({ student }) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:shadow-md transition">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <img
          src={student.avatar}
          alt={student.name}
          className="w-12 h-12 rounded-full border object-cover shadow"
        />
        <div className="text-gray-700 text-sm">
          <p className="font-semibold">{student.name}</p>
          <p className="text-xs">📧 {student.email}</p>
          <p className="text-xs">📞 {student.phone}</p>
        </div>
      </div>

      <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto text-sm">
        <ProgressBar value={student.progress} />
        <p className="text-xs text-gray-600">
          📁 {student.assignments} devoirs soumis
        </p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-green-600 hover:underline text-xs">
            <FiDownload /> Devoirs
          </button>
          <button className="flex items-center gap-1 text-indigo-600 hover:underline text-xs">
            <FiMessageSquare /> Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
