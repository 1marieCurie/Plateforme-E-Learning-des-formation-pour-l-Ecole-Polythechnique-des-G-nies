import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const StudentDropdown = ({ students = [], courseId, onClose }) => {
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white right-0 mt-2 w-72 shadow-lg rounded-lg border border-gray-200 z-30"
    >
      <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto">
        {students.slice(0, 4).map((student, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <img
              src={student.avatar}
              alt={`${student.nom} ${student.prenom}`}
              className="w-9 h-9 rounded-full object-cover border"
            />
            <p className="text-sm text-gray-700 font-medium">
              {student.nom} {student.prenom}
            </p>
          </div>
        ))}

        {/* Lien Voir tout */}
        {students.length > 0 && (
          <div className="pt-2 border-t text-right">
            <Link
              to={`/teacher/étudiants?course=${courseId}`}
              className="text-indigo-600 hover:underline text-sm"
            >
              → Voir tout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDropdown;
