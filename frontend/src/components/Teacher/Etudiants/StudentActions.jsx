// src/components/Teacher/Etudiants/StudentActions.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FiDownload, FiMessageSquare, FiUser } from "react-icons/fi";

const StudentActions = ({ studentId }) => {
  return (
    <div className="flex gap-2">
      <Link
        to={`/teacher/etudiant/${studentId}`}
        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
      >
        <FiUser /> Profil
      </Link>
      <button className="text-green-600 hover:underline text-sm flex items-center gap-1">
        <FiDownload /> Devoirs
      </button>
      <button className="text-indigo-600 hover:underline text-sm flex items-center gap-1">
        <FiMessageSquare /> Feedback
      </button>
    </div>
  );
};

export default StudentActions;
