// src/pages/Teacher/TeacherDashboard.jsx


import React from "react";
import ActiveCoursesList from "@/components/Teacher/Dashboard/ActiveCoursesList";
import TeacherStatsCards from "@/components/Teacher/Dashboard/TeacherStatsCards";
import useCourses from "@/hooks/useCourses";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

// Couleurs de fond pour les icônes
const fallbackColors = [
  "#c7d2fe", // bleu clair
  "#fcd34d", // jaune
  "#fca5a5", // rouge clair
  "#6ee7b7", // vert clair
  "#f9a8d4", // rose
  "#fbbf24", // orange
];







const TeacherDashboard = () => {
  const { courses, loading, error } = useCourses();
  const { profile, loading: loadingProfile, error: errorProfile } = useTeacherProfile();

  // Adapter les données pour ActiveCoursesList
  const mappedCourses = (courses || []).map((course, idx) => ({
    ...course, // Inclut toutes les propriétés, y compris formation
    color: fallbackColors[idx % fallbackColors.length],
  }));

  // Stats réelles depuis le profil
  const teacherStats = {
    totalCourses: profile?.total_courses ?? 0,
    totalStudents: profile?.total_students ?? 0,
    averageRating: profile?.average_rating ?? 0,
  };

  return (
    <div className="p-6 bg-indigo-50 space-y-10">
      <h1 className="text-2xl font-semibold">
        <span className="bg-indigo-200 rounded p-2">Bienvenue dans votre espace formateur</span>
      </h1>

      <p className="text-gray-700">
        vous pouvez suivre vos cours, consultez les retours des étudiants, et visualisez vos statistiques pédagogiques.
      </p>

      {/* Section Cours Actifs */}
      <section>
        {loading ? (
          <div className="text-center text-gray-500">Chargement des cours...</div>
        ) : error ? (
          <div className="text-center text-red-500">Erreur : {error}</div>
        ) : (
          <ActiveCoursesList courses={mappedCourses} />
        )}
      </section>
      <section>
        {loadingProfile ? (
          <div className="text-center text-gray-500">Chargement des statistiques...</div>
        ) : errorProfile ? (
          <div className="text-center text-red-500">Erreur : {errorProfile}</div>
        ) : (
          <TeacherStatsCards stats={teacherStats} />
        )}
      </section>
    </div>
  );
};

export default TeacherDashboard;
