// src/pages/Teacher/MesCours.jsx


import React, { useEffect, useState } from "react";
import CourseCard from "@/components/Teacher/MesCours/CourseCard";
import CourseCreationSection from "@/components/Teacher/MesCours/CourseCreationSection";
import SearchBar from "@/components/Teacher/Formations/SearchBar";
import { useCourses } from "@/hooks/useCourses";



const MesCours = () => {
  const {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse
  } = useCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseForm, setShowCourseForm] = useState(false);
  // Récupérer les chapitres pour chaque cours via une fonction utilitaire (pas un hook dans une boucle)
  const [chaptersByCourse, setChaptersByCourse] = useState({});

  useEffect(() => {
    const fetchChapters = async () => {
      const token = localStorage.getItem('token');
      // Lancer toutes les requêtes en parallèle
      const results = await Promise.all(
        courses.map(async (course) => {
          const response = await fetch(`/api/courses/${course.id}/chapters/manage`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log('API chapitres - course', course.id, 'response:', data);
          let chapitres = [];
          if (Array.isArray(data.data)) {
            chapitres = data.data.map(ch => ({
              id: ch.id,
              titre: ch.titre,
              duree: ch.duree || ch.duration_minutes || '',
              description: ch.description || '',
              video: ch.video || ch.video_url || ''
            })).filter(ch => ch.titre && ch.id);
          } else if (Array.isArray(data.chapitres)) {
            chapitres = data.chapitres.filter(ch => ch.titre && ch.id);
          } else if (Array.isArray(data)) {
            chapitres = data.filter(ch => ch.titre && ch.id);
          } else if (typeof data === 'object' && data !== null) {
            chapitres = Object.entries(data)
              .filter(([key, value]) => key !== 'success' && key !== 'data' && value && value.titre)
              .map(([key, value]) => ({
                id: value.id || key,
                titre: value.titre,
                duree: value.duree || value.duration_minutes || '',
                description: value.description || '',
                video: value.video || value.video_url || ''
              }));
          }
          return { courseId: course.id, chapitres };
        })
      );
      // Reconstituer le mapping
      const chaptersMap = {};
      results.forEach(({ courseId, chapitres }) => {
        chaptersMap[courseId] = chapitres;
      });
      setChaptersByCourse(chaptersMap);
    };

    if (courses.length > 0) {
      fetchChapters();
    }
  }, [courses]);

  // Suppression d'un cours
  const handleDelete = async (id, force = false) => {
    try {
      await deleteCourse(id, force);
    } catch {
      // Erreur déjà gérée par le hook (toast)
    }
  };

  // Mise à jour d'un cours
  const handleUpdate = async (updatedCourse) => {
    try {
      await updateCourse(updatedCourse.id, updatedCourse);
    } catch {
      // Erreur déjà gérée par le hook (toast)
    }
  };

  // Création d'un nouveau cours
  const handleAddCourse = async (newCourse) => {
    try {
      await createCourse(newCourse);
      // Le toast de succès est géré dans CourseCreationSection.jsx
    } catch {
      // Erreur déjà gérée par le hook (toast)
    }
  };

  // Filtrer les cours selon la recherche
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Memoize suggestions to avoid infinite update loop in SearchBar
  const courseSuggestions = React.useMemo(() => courses.map(c => c.title), [courses]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Cours</h2>

      {/* Barre de recherche et bouton d'ajout */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            searchQuery={searchQuery}
            onSearch={(value) => {
              setSearchQuery(value);
              if (showCourseForm && value.length > 0) {
                setShowCourseForm(false);
              }
            }}
            placeholder="Rechercher un cours..."
            suggestions={courseSuggestions}
          />
        </div>
        <button
          onClick={() => setShowCourseForm(true)}
          className="flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition"
        >
          + Ajouter un cours
        </button>
      </div>

      {/* Formulaire d'ajout de cours */}
      {showCourseForm && (
        <CourseCreationSection
          onSubmit={async (data) => {
            await handleAddCourse(data);
            setShowCourseForm(false);
          }}
          onClose={() => setShowCourseForm(false)}
        />
      )}

      {loading && <div>Chargement des cours...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {filteredCourses.length === 0 && !loading && <div>Aucun cours trouvé.</div>}

      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            chapitres={Array.isArray(chaptersByCourse[course.id]) ? chaptersByCourse[course.id] : Object.values(chaptersByCourse[course.id] || {})}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default MesCours;
