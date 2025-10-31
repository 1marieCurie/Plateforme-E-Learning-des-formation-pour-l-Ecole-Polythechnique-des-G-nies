/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import SearchBar from '@/components/Teacher/Formations/SearchBar';
import ContentFilters from '@/pages/Etudiant/CoursSuivis.jsx';
import { FiMoreVertical } from "react-icons/fi";
import { motion } from "framer-motion";
import axiosInstance from "@/api/axios";
import { getUser } from "@/services/auth";
import { FiUser, FiClock, FiBarChart, FiCheckCircle, FiEye } from "react-icons/fi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { MdStarRate } from "react-icons/md";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useStudentCourses } from '@/hooks/useStudentCourses';



const FormationsBrowser = () => {
  const [formations, setFormations] = useState([]);
  const [enrolledFormations, setEnrolledFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [modalOpenId, setModalOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('formationSearchHistory')) || [];
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Désinscription d'une formation
  const handleUnenroll = async (enrollmentId) => {
    try {
      await axiosInstance.delete(`/formation-enrollments/${enrollmentId}`);
      await reloadEnrollments();
      toast.success("Désinscription réussie. Toutes vos données liées à cette formation ont été supprimées.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
    } catch (error) {
      toast.error("Erreur lors de la désinscription.");
    } finally {
      setModalOpenId(null);
    }
  };
  const navigate = useNavigate();

  const { reloadFormations } = useStudentCourses();

  // Recharge les inscriptions depuis l'API et met à jour l'état
  const reloadEnrollments = async () => {
    try {
      const enrollmentsResponse = await axiosInstance.get('/user/enrollments');
      const enrolledIds = (enrollmentsResponse.data || [])
        .map(enrollment => enrollment.formation_id);
      setEnrolledFormations(enrolledIds);
    } catch (err) {
      // Optionnel : afficher une erreur ou ignorer
    }
  };

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // Charger les formations et les inscriptions en parallèle
    const [formationsResponse, enrollmentsResponse] = await Promise.all([
      axiosInstance.get('/formations').catch(err => {
        console.error("Erreur formations:", err);
        return { data: [] };
      }),
      axiosInstance.get('/user/enrollments').catch(err => {
        console.error("Erreur enrollments:", err);
        return { data: [] };
      })
    ]);

    const formationsData = formationsResponse.data || [];
    const enrollmentsData = enrollmentsResponse.data || [];

    // Associer l'enrollmentId à chaque formation inscrite
    const formationsWithEnrollmentId = formationsData.map(f => {
      const enrollment = enrollmentsData.find(e => e.formation_id === f.id);
      return enrollment ? { ...f, enrollmentId: enrollment.id } : f;
    });

    setFormations(formationsWithEnrollmentId);

    // Extraire les IDs des formations où l'utilisateur est inscrit
    const enrolledIds = enrollmentsData.map(enrollment => enrollment.formation_id);
    setEnrolledFormations(enrolledIds);
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    setError("Impossible de charger les données. Vérifiez votre connexion.");
  } finally {
    setLoading(false);
  }
};

  const handleEnroll = async (formationId) => {
    setEnrolling(formationId);
    try {
      // Utiliser la bonne route pour l'inscription
      await axiosInstance.post('/formation-enrollments', {
        formation_id: formationId
      });

      // Recharger la liste des inscriptions depuis l'API pour garantir la cohérence
      await reloadEnrollments();

      toast.success("Inscription réussie ! Vous pouvez maintenant accéder au contenu de la formation.");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      if (
        (error.response?.status === 400 && error.response?.data?.error?.includes('déjà inscrit')) ||
        (error.response?.status === 422 && error.response?.data?.error?.includes('déjà inscrit'))
      ) {
        toast.info("Vous êtes déjà inscrit à cette formation.");
        // Forcer le reload des inscriptions pour corriger l'affichage
        await reloadEnrollments();
      } else {
        toast.error(error.response?.data?.error || "Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setEnrolling(null);
    }
  };

  const handleViewFormation = (formationId) => {
    const isEnrolled = enrolledFormations.includes(formationId);
    
    if (isEnrolled) {
      // Si inscrit, aller directement aux cours suivis
      navigate('/student/cours-suivis');
    } else {
      // Sinon, afficher les détails de la formation
      navigate(`/formations/${formationId}`);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'debutant': return 'bg-green-100 text-green-800';
      case 'intermediaire': return 'bg-yellow-100 text-yellow-800';
      case 'avance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 'debutant': return 'Débutant';
      case 'intermediaire': return 'Intermédiaire';
      case 'avance': return 'Avancé';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Chargement des formations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Extraire les catégories uniques
  const categories = [...new Set(formations.map(f => f.category?.nom).filter(Boolean))];

  // Met à jour l'historique de recherche
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('formationSearchHistory', JSON.stringify(newHistory));
    }
  };

  // Filtrer les formations selon la recherche et la catégorie
  const filteredFormations = formations.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || f.category?.nom === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            <span className="bg-indigo-100 rounded p-2">Formations disponibles</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Découvrez et inscrivez-vous aux formations qui vous intéressent
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/cours_suivis')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            Mes cours suivis
          </button>
          <div className="text-sm text-gray-500">
            {formations.length} formation{formations.length > 1 ? 's' : ''} disponible{formations.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar searchQuery={searchQuery} onSearch={handleSearchChange} />
          {searchHistory.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 mr-2">Historique&nbsp;:</span>
              {searchHistory.map((item, idx) => (
                <button
                  key={item + idx}
                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs hover:bg-indigo-100"
                  onClick={() => setSearchQuery(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              onClick={() => setSelectedCategory(null)}
            >
              Toutes catégories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille des formations filtrées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.map((formation, index) => {
          const isEnrolled = enrolledFormations.includes(formation.id);
          const isEnrollingThis = enrolling === formation.id;
          // Cherche l'enrollmentId pour cette formation
          let enrollmentId = null;
          if (formation.enrollmentId) {
            enrollmentId = formation.enrollmentId;
          } else if (formation.enrollment && formation.enrollment.id) {
            enrollmentId = formation.enrollment.id;
          } else if (Array.isArray(window.__enrollments)) {
            const found = window.__enrollments.find(e => e.formation_id === formation.id);
            if (found && found.id) enrollmentId = found.id;
          }

          return (
            <motion.div
              key={formation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
            >
              {/* Header avec gradient et titre */}
              <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                <div className="flex flex-col items-center justify-center h-full text-white p-4">
                  <HiOutlineBadgeCheck className="w-12 h-12 mb-3 opacity-90" />
                  <h3 className="text-lg font-bold text-center leading-tight">
                    {formation.title}
                  </h3>
                </div>

                {/* Badge de difficulté + menu 3 points verticaux alignés */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(formation.difficulty_level)}`}>
                    {getDifficultyLabel(formation.difficulty_level)}
                  </span>
                  {isEnrolled && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === formation.id ? null : formation.id)}
                        className="p-1 rounded-full hover:bg-indigo-200 focus:outline-none"
                        title="Options"
                      >
                        <FiMoreVertical className="w-5 h-5 text-white" />
                      </button>
                      {menuOpenId === formation.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg z-20">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => {
                              setMenuOpenId(null);
                              setModalOpenId(formation.id);
                            }}
                          >
                            Se désinscrire
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Badge si inscrit */}
                {isEnrolled && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
                      <FiCheckCircle className="w-3 h-3 mr-1" />
                      Inscrit
                    </span>
                  </div>
                )}
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                {/* Titre et catégorie */}
                <div className="mb-3">
                  <span className="text-sm text-indigo-600 font-medium">
                    {formation.category?.nom || 'Non catégorisé'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {formation.description || 'Aucune description disponible'}
                </p>

                {/* Informations du formateur */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formation.teacher?.name || formation.teacher?.nom || 'Formateur'}
                    </p>
                    <p className="text-xs text-gray-500">Formateur</p>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="flex flex-col items-center">
                    <FiClock className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600">
                      {formation.duration_hours || 0}h
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FiBarChart className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600">
                      {formation.courses_count || 0} cours
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MdStarRate className="w-4 h-4 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-600">
                      {formation.average_rating || 0}/5
                    </span>
                  </div>
                </div>

                {/* Nombre d'inscrits */}
                <div className="text-center mb-4">
                  <span className="text-xs text-gray-500">
                    {formation.total_enrolled || 0} étudiant{(formation.total_enrolled || 0) > 1 ? 's' : ''} inscrit{(formation.total_enrolled || 0) > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  {isEnrolled ? (
                    <button 
                      onClick={() => navigate('/student/cours_suivis')}
                      className="flex-1 bg-green-100 text-green-800 py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center hover:bg-green-200 transition-colors"
                    >
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      Accéder aux cours
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(formation.id)}
                      disabled={isEnrollingThis}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        isEnrollingThis
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isEnrollingThis ? (
                        <div className="flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Inscription...
                        </div>
                      ) : (
                        "S'inscrire"
                      )}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate('/student/cours_suivis', { state: { formationId: formation.id } })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal de confirmation désinscription avec animation, blur, croix, style amélioré */}
                {modalOpenId === formation.id && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      transition: 'backdrop-filter 0.3s',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md border border-gray-100"
                    >
                      {/* Bouton fermeture */}
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setModalOpenId(null)}
                        aria-label="Fermer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex flex-col items-center">
                        <HiOutlineBadgeCheck className="w-12 h-12 text-indigo-500 mb-2" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Confirmation de désinscription</h3>
                        <p className="text-red-600 text-center mb-6 font-medium">Attention&nbsp;: cette action supprimera définitivement toute votre progression et vos statistiques dans cette formation. Voulez-vous vraiment supprimer votre inscription&nbsp;?</p>
                        <div className="flex justify-center gap-4 mt-2">
                          <button
                            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium shadow-sm"
                            onClick={() => setModalOpenId(null)}
                          >
                            Non
                          </button>
                          <button
                            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-sm"
                            onClick={() => handleUnenroll(enrollmentId)}
                          >
                            Oui, se désinscrire
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Message si aucune formation */}
      {formations.length === 0 && (
        <div className="text-center py-12">
          <HiOutlineBadgeCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune formation disponible
          </h3>
          <p className="text-gray-500">
            Les formations seront bientôt disponibles. Revenez plus tard !
          </p>
        </div>
      )}
    </div>
  );
};

export default FormationsBrowser;