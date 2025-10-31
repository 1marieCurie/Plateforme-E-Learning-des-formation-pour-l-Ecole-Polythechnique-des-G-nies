// StudentDashboard.jsx

import React from "react";
import AnimatedCoursesList from "../components/AnimatedCoursesList";
import { useStudentCourses } from "../hooks/useStudentCourses";

// Couleurs fallback pour les cours sans image
const fallbackColors = [
  "#c7d2fe", // bleu clair
  "#fcd34d", // jaune
  "#fca5a5", // rouge clair
  "#6ee7b7", // vert clair
  "#f9a8d4", // rose
  "#fbbf24", // orange
];

const StudentDashboard = () => {

  const { courses, loading, error } = useStudentCourses();

  // Adapter les données pour AnimatedCoursesList
  const mappedCourses = (courses || []).map((course, idx) => ({
    image: course.image && course.image !== '/api/placeholder/400/200'
      ? course.image
      : undefined,
    // Si pas d'image, AnimatedCoursesList affichera une couleur via style inline
    color: fallbackColors[idx % fallbackColors.length],
    name: course.title || course.name || 'Cours',
    rating: course.rating || 4, // Si pas de rating, valeur par défaut
    progress: course.progress || 0,
    chapter: course.last_chapter || course.chapter || 'Chapitre inconnu',
  }));

  const handleSelect = (course, idx) => {
    console.log("Selected:", course, idx);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">
        <span className="bg-blue-200 rounded p-2">Bienvenue dans votre espace étudiant</span>
      </h1>

      <p className="text-gray-700 mb-8">
        Ce tableau de bord vous permet de consulter vos formations, vos inscriptions, et de suivre vos progrès.
      </p>

      {loading ? (
        <div className="text-center text-gray-500">Chargement des cours...</div>
      ) : error ? (
        <div className="text-center text-red-500">Erreur : {error}</div>
      ) : (
        <AnimatedCoursesList courses={mappedCourses} onCourseSelect={handleSelect} />
      )}
    </>
  );
};


export default StudentDashboard;
