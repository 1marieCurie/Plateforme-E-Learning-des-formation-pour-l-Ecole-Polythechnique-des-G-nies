/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChapterView from "@/components/Student/CoursSuivis/ChapterView";
import EvaluationProfSection from "@/components/Student/CoursSuivis/EvaluationProfSection";
import { useStudentCourses } from "@/hooks/useStudentCourses";
import { BookOpen, Users, Calendar, Award, ArrowRight, GraduationCap } from "lucide-react";

// Composant ProgressBar intégré
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 h-3 rounded-full">
    <div
      className={`h-3 rounded-full transition-all duration-300 ${
        progress === 100 ? "bg-green-500" : "bg-indigo-500"
      }`}
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// Composant SearchBar intégré
const SearchBar = ({ searchQuery, onSearch }) => (
  <div className="relative mb-6">
    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
    <input
      type="text"
      placeholder="Rechercher un cours ou une formation..."
      value={searchQuery}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

// Composant Filtres avec support formations/cours
const ContentFilters = ({ categories, selectedCategory, onFilterChange, viewMode, onViewModeChange }) => (
  <div className="mb-6">
    {/* Sélecteur de vue */}
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onViewModeChange('formations')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          viewMode === 'formations'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <GraduationCap className="w-4 h-4" />
        Mes Formations
      </button>
      <button
        onClick={() => onViewModeChange('cours')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          viewMode === 'cours'
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        Tous les Cours
      </button>
    </div>

    {/* Filtres par catégorie */}
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !selectedCategory
            ? 'bg-indigo-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Tous
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
);

// Composant pour les cartes de formation
const FormationCard = ({ formation, onViewCourses, onProgressUpdate }) => {
  const { id, title, description, category, teacher_name, progress, total_courses, completed_courses, enrolled_at } = formation;

  const handleViewCourses = () => {
    onViewCourses(formation);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Nouveau header avec gradient et titre centré */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <h2 className="text-xl font-bold text-white text-center px-4 w-full z-10 drop-shadow-lg">{title}</h2>
        {progress === 100 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
            <Award className="w-4 h-4" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Formation
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{teacher_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{total_courses} cours</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Inscrit le {new Date(enrolled_at).toLocaleDateString()}</span>
        </div>

        {/* Barre de progression */}
        <div className="mt-2">
          <ProgressBar progress={progress} />
        </div>
        <p className="text-right text-sm text-gray-500">
          {completed_courses}/{total_courses} cours • {Math.round(progress)}%
        </p>

        {/* Boutons d'action */}
        <div className="mt-3 space-y-2">
          <button 
            onClick={handleViewCourses}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            Voir les cours
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant CourseCard mis à jour
const CourseCard = ({ course, onProgressUpdate, onViewChapters }) => {
  const { id, title, description, image, category, formation_title, progress, duration_minutes, chapters_count } = course;

  const renderStars = () => {
    const rating = course.rating || 4;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? "text-yellow-400" : "text-gray-300"}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const handleContinue = () => {
    onViewChapters(course);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Nouveau header avec gradient bleu et icône livre centrée */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <svg className="w-12 h-12 text-white opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
        </svg>
        {progress === 100 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{title}</h2>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        
        <p className="text-xs text-indigo-600 font-medium">
          Formation : {formation_title}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{chapters_count} chapitres</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{Math.round(duration_minutes / 60)}h</span>
          </div>
        </div>

        {/* Étoiles */}
        <div className="flex gap-1">{renderStars()}</div>

        {/* Barre de progression */}
        <div className="mt-2">
          <ProgressBar progress={progress} />
        </div>
        <p className="text-right text-sm text-gray-500">{Math.round(progress)}%</p>

        {/* Boutons d'action */}
        <div className="mt-3 space-y-2">
          <button 
            onClick={handleContinue}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            {progress === 0 ? 'Commencer' : progress === 100 ? 'Revoir' : 'Continuer'}
          </button>
          
          {progress > 0 && (
            <button 
              onClick={() => onViewChapters(course)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Voir les chapitres ({Math.round(progress)}%)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant principal
const CoursSuivis = () => {
  const location = useLocation();
  // Chargement initial des données une seule fois
  useEffect(() => {
    fetchFollowedCourses();
  }, []);
  const {
    courses,
    formations,
    loading,
    error,
    fetchFollowedCourses,
    fetchFormationCourses,
    updateCourseProgress,
    updateFormationProgress
  } = useStudentCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  // On mémorise le mode de vue courant sans déclencher de fetch
  const [viewMode, setViewMode] = useState('formations'); // 'formations' ou 'cours'
  const [currentView, setCurrentView] = useState('list'); // 'list', 'chapters', 'formation-courses'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [formationCourses, setFormationCourses] = useState([]);

  // Si navigation avec formationId, afficher directement les cours de cette formation
  useEffect(() => {
    const formationId = location.state?.formationId;
    if (formationId && formations.length > 0) {
      const formation = formations.find(f => f.id === formationId);
      if (formation) {
        handleViewFormationCourses(formation);
      }
    }
    // eslint-disable-next-line
  }, [location.state?.formationId, formations]);
    // Rafraîchir la progression de la formation après la progression d'un cours
    const handleCourseProgressUpdate = async (courseId, newProgress) => {
      await updateCourseProgress(courseId, newProgress);
      // Trouver la formation liée au cours
      const course = courses.find(c => c.id === courseId);
      if (course && course.formation_id) {
        await updateFormationProgress(course.formation_id);
      }
    };
  // Navigation vers la liste des cours d'une formation depuis la vue formations
  // Ne recharge les cours d'une formation que si ce n'est pas déjà la formation sélectionnée
  const handleViewFormationCourses = async (formation) => {
    if (!selectedFormation || selectedFormation.id !== formation.id) {
      const courses = await fetchFormationCourses(formation.id);
      setFormationCourses(courses);
    }
    setSelectedFormation(formation);
    setCurrentView('formation-courses');
    setSelectedCourse(null);
  };

  const handleSearch = (query) => setSearchQuery(query);
  const handleFilterChange = (category) => setSelectedCategory(category);

  // Navigation vers la vue des chapitres
  const handleViewChapters = (course) => {
    setSelectedCourse(course);
    setCurrentView('chapters');
  };

  // Retour à la liste des cours d'une formation depuis la vue chapitres
  const handleBackToCourses = async () => {
    // Recharge les cours de la formation sélectionnée
    if (selectedFormation) {
      const courses = await fetchFormationCourses(selectedFormation.id);
      setFormationCourses(courses);
      setCurrentView('formation-courses');
      setSelectedCourse(null);
    }
  };

  // Retour à la liste des formations depuis la vue des cours
  const handleBackToFormations = () => {
    setCurrentView('list');
    setSelectedFormation(null);
    setFormationCourses([]);
    setSelectedCourse(null);
    // Ne recharge plus les formations ici pour un retour instantané
  };

  // Vue des chapitres
  if (currentView === 'chapters' && selectedCourse) {
    return (
      <div>
        <ChapterView 
          courseId={selectedCourse.id}
          courseName={selectedCourse.title}
          onBack={handleBackToCourses}
        />
        <EvaluationProfSection courseId={selectedCourse.id} />
      </div>
    );
  }

  // Vue des cours d'une formation
  if (currentView === 'formation-courses' && selectedFormation) {
    const filteredCourses = formationCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(formationCourses.map(course => course.category))];

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header avec retour */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBackToFormations}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux formations
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{selectedFormation.title}</h1>
            <p className="text-gray-600">Cours de cette formation</p>
          </div>
        </div>

        {/* Barre de recherche */}
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />

        {/* Filtres */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liste des cours */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onProgressUpdate={handleCourseProgressUpdate}
                onViewChapters={handleViewChapters}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Cette formation ne contient pas encore de cours.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Affichage de la liste des cours (mode "cours")
  if (currentView === 'cours') {
    // Extraire les catégories uniques pour les cours
    const categories = [...new Set(courses.map(course => course.category))];

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center mb-6">
          <button
            onClick={() => setViewMode('formations')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux formations
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Tous les cours</h1>
        </div>

        {/* Barre de recherche */}
        <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />

        {/* Filtres */}
        <ContentFilters 
          categories={categories}
          selectedCategory={selectedCategory}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-indigo-600">{formations.length}</div>
            <div className="text-sm text-gray-600">Formations inscrites</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {formations.filter(f => f.progress === 100).length}
            </div>
            <div className="text-sm text-gray-600">Formations terminées</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-yellow-600">
              {formations.filter(f => f.progress > 0 && f.progress < 100).length}
            </div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-gray-600">
              {Math.round(formations.reduce((acc, formation) => acc + formation.progress, 0) / formations.length) || 0}%
            </div>
            <div className="text-sm text-gray-600">Progression moyenne</div>
          </div>
        </div>

        {/* Liste des formations/cours */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item) => (
              viewMode === 'formations' ? (
                <FormationCard
                  key={item.id}
                  formation={item}
                  onProgressUpdate={updateFormationProgress}
                  onViewCourses={handleViewFormationCourses}
                />
              ) : (
                <CourseCard
                  key={item.id}
                  course={item}
                  onProgressUpdate={updateCourseProgress}
                  onViewChapters={handleViewChapters}
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {viewMode === 'formations' ? (
              <>
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation trouvée</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || selectedCategory 
                    ? 'Essayez de modifier vos critères de recherche.' 
                    : 'Vous n\'êtes inscrit à aucune formation pour le moment.'}
                </p>
              </>
            ) : (
              <>
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || selectedCategory 
                    ? 'Essayez de modifier vos critères de recherche.' 
                    : 'Vous n\'avez pas encore de cours disponibles.'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Affichage en cours de chargement
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos formations et cours...</p>
        </div>
      </div>
    );
  }

  // Données à afficher selon le mode
  const currentData = viewMode === 'formations' ? formations : courses;
  const filteredData = currentData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extraire les catégories uniques
  const mainCategories = [...new Set(currentData.map(item => item.category))];

  // Affichage principal
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mon Apprentissage</h1>
        <p className="text-gray-600">Continuez votre apprentissage où vous vous êtes arrêté</p>
      </div>

      {/* Barre de recherche */}
      <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />

      {/* Filtres */}
        <ContentFilters 
          categories={mainCategories}
          selectedCategory={selectedCategory}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            // On change juste la vue, sans fetch
            setViewMode(mode);
          }}
        />

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-indigo-600">{formations.length}</div>
          <div className="text-sm text-gray-600">Formations inscrites</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">
            {formations.filter(f => f.progress === 100).length}
          </div>
          <div className="text-sm text-gray-600">Formations terminées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-yellow-600">
            {formations.filter(f => f.progress > 0 && f.progress < 100).length}
          </div>
          <div className="text-sm text-gray-600">En cours</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-gray-600">
            {Math.round(formations.reduce((acc, formation) => acc + formation.progress, 0) / formations.length) || 0}%
          </div>
          <div className="text-sm text-gray-600">Progression moyenne</div>
        </div>
      </div>

      {/* Liste des formations/cours */}
      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            viewMode === 'formations' ? (
              <FormationCard
                key={item.id}
                formation={item}
                onProgressUpdate={updateFormationProgress}
                onViewCourses={handleViewFormationCourses}
              />
            ) : (
              <CourseCard
                key={item.id}
                course={item}
                onProgressUpdate={handleCourseProgressUpdate}
                onViewChapters={handleViewChapters}
              />
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {viewMode === 'formations' ? (
            <>
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune formation trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCategory 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Vous n\'êtes inscrit à aucune formation pour le moment.'}
              </p>
            </>
          ) : (
            <>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCategory 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Vous n\'avez pas encore de cours disponibles.'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CoursSuivis;