/* eslint-disable no-unused-vars */
// src/components/AnimatedCoursesList.jsx

import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FiArrowRight, FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function AnimatedCoursesList({ courses, onCourseSelect }) {
  const items = (courses ?? []).slice(0, 4).map((c, idx) => ({
    // On ne garde plus l'image, on affiche une icône
    color: c.color || "#c7d2fe", // fallback bleu clair
    title: c.name,
    chapter: c.chapter || "Chapitre inconnu",
    rating: c.rating,
    progress: c.progress,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Titre + lien */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-gray-800">Vos cours suivis</h2>
        <Link
          to="/student/cours_suivis"
          className="flex items-center text-blue-600 hover:text-blue-800 transition"
        >
          Voir tous les cours
          <FiArrowRight className="ml-1" />
        </Link>
      </div>

      {/* Grille des cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center bg-white rounded-xl shadow-xl p-4 transform transition duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div
              className="w-20 h-20 mr-4 flex items-center justify-center rounded-md"
              style={{ background: item.color }}
            >
              <FiBookOpen className="text-indigo-600" style={{ fontSize: 38 }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Dernier chapitre :{" "}
                <span className="font-medium text-indigo-600">{item.chapter}</span>
              </p>
              <div className="flex items-center text-yellow-400 mt-2">
                {Array.from({ length: 5 }).map((_, i2) =>
                  i2 < item.rating ? <FaStar key={i2} /> : <FaRegStar key={i2} />
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
