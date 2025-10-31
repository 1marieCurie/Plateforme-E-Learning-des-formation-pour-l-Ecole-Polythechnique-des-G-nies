// src/pages/Teacher/Etudiants.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentTable from "@/components/Teacher/Etudiants/StudentTable";
import CourseSelector from "@/components/Teacher/Etudiants/CourseSelector";
import useCourses from '@/hooks/useCourses';

const Etudiants = () => {
  const navigate = useNavigate();
  const { courses } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

  useEffect(() => {
    // Générer la liste des cours pour le sélecteur
    if (courses && Array.isArray(courses)) {
      setCourseOptions(courses.map(c => ({ id: String(c.id), title: c.title })));
    }
  }, [courses]);

  useEffect(() => {
    if (selectedCourseId && courses && Array.isArray(courses)) {
      const course = courses.find(c => String(c.id) === String(selectedCourseId));
      if (course && Array.isArray(course.studentsList)) {
        setStudents(course.studentsList.map(student => ({
          id: student.id,
          name: student.name || student.nom || '',
          email: student.email || '',
          tel: student.tel || '',
          enrolled_at: student.enrolled_at || '',
          progress: student.progress ?? student.progress_percentage ?? 0,
          avatar: student.avatar || `https://i.pravatar.cc/150?img=${student.id}`,
        })));
      } else {
        setStudents([]);
      }
    } else {
      setStudents([]);
    }
  }, [selectedCourseId, courses]);

  // Rassembler tous les étudiants de tous les cours si aucun cours n'est sélectionné
  const allStudents = React.useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    const seen = new Map(); // id => student
    courses.forEach(course => {
      if (Array.isArray(course.studentsList)) {
        course.studentsList.forEach(student => {
          if (!seen.has(student.id)) {
            seen.set(student.id, {
              id: student.id,
              name: student.name || student.nom || '',
              email: student.email || '',
              tel: student.tel || '',
              avatar: student.avatar || `https://i.pravatar.cc/150?img=${student.id}`,
              formations: []
            });
          }
          // Ajoute la formation à la liste de l'étudiant
          const s = seen.get(student.id);
          s.formations.push({
            nom: course.title,
            progression: student.progress ?? student.progress_percentage ?? 0
          });
        });
      }
    });
    // Tri alphabétique
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Étudiants par cours</h2>
      {/* Sélection du cours */}
      <CourseSelector
        courses={courseOptions}
        selectedCourseId={selectedCourseId}
        onChange={setSelectedCourseId}
      />

      {/* Section Avancement ou tableau général */}
      {selectedCourseId ? (
        students.length > 0 ? (
          <div className="mt-8">
            <h3 className="flex items-start text-xl font-semibold text-gray-700 mb-4">Avancement des étudiants</h3>
            <StudentTable students={students} />
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-6">Aucun étudiant inscrit pour ce cours.</p>
        )
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Tous les étudiants</h3>
            <button
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded transition"
              style={{ minWidth: '40px' }}
              title="Voir les évaluations des étudiants"
              onClick={() => navigate('/teacher/évaluation')}
            >
              <span className="text-base font-medium">Évaluations</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <StudentTable students={allStudents} />
        </div>
      )}
    </div>
  );
};

export default Etudiants;
