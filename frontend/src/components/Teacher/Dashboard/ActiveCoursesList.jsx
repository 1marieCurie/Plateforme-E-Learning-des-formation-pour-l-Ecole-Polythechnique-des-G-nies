// src/components/Teacher/Dashboard/ActiveCoursesList.jsx


import React from "react";
import { Link } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";

const ActiveCoursesList = ({ courses }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Cours actifs</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg p-6 space-y-3 transition-all hover:shadow-xl"
          >
            {/* Icône du cours avec fond coloré */}
            <div
              className="w-full h-40 flex items-center justify-center rounded-md mb-2"
              style={{ background: course.color }}
            >
              <FiBookOpen className="text-indigo-600" style={{ fontSize: 48 }} />
            </div>

            {/* Titre et infos */}
            <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                {/* Suppression de l'information sur le nombre d'étudiants inscrits */}

            {/* Statut */}
            <p className="text-sm text-indigo-700 font-semibold">
              {typeof course.formation?.title === "string" ? course.formation.title : "Formation inconnue"}
            </p>

            {/* Lien */}
            <Link
              to={`/teacher/mes_cours`}
              className="text-blue-600 hover:underline text-sm inline-block mt-2"
            >
              Gérer le cours
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveCoursesList;
