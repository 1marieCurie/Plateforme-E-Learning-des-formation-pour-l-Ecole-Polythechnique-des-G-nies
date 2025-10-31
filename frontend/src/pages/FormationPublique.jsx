/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/api/axios";
import { FiUser, FiClock, FiBarChart } from "react-icons/fi";
import { X, UserPlus, LogIn } from "lucide-react";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { MdStarRate } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const FormationPublique = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/formationPublique');
      setFormations(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des formations:", error);
      setError("Impossible de charger les formations. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = (formation) => {
    setSelectedFormation(formation);
    setIsModalOpen(true);
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
      <div className="flex justify-center items-center min-h-[400px] pt-20">
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
      <div className="text-center py-8 pt-32">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={loadFormations}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-50 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Nos Formations
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre catalogue de formations professionnelles. 
              Inscrivez-vous pour accéder au contenu complet et commencer votre apprentissage.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              {formations.length} formation{formations.length > 1 ? 's' : ''} disponible{formations.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Grille des formations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation, index) => (
              <motion.div
                key={formation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Header avec gradient et titre */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                  <div className="flex flex-col items-center justify-center h-full text-white p-4">
                    <HiOutlineBadgeCheck className="w-12 h-12 mb-3 opacity-90" />
                    <h3 className="text-lg font-bold text-center leading-tight">
                      {formation.title}
                    </h3>
                  </div>
                  
                  {/* Badge de difficulté */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(formation.difficulty_level)}`}>
                      {getDifficultyLabel(formation.difficulty_level)}
                    </span>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-6">
                  {/* Catégorie */}
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
                        {formation.teacher?.nom || 'Formateur'}
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

                  {/* Prix */}
                  <div className="text-center mb-4 py-2 bg-gray-50 rounded-lg">
                    <span className="text-2xl font-bold text-indigo-600">
                      {formation.price === 0 ? 'Gratuit' : `${formation.price} DH`}
                    </span>
                  </div>

                  {/* Nombre d'inscrits */}
                  <div className="text-center mb-4">
                    <span className="text-xs text-gray-500">
                      {formation.total_enrolled || 0} étudiant{(formation.total_enrolled || 0) > 1 ? 's' : ''} inscrit{(formation.total_enrolled || 0) > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Bouton d'inscription */}
                  <button
                    onClick={() => handleSignupClick(formation)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    S'inscrire maintenant
                  </button>
                </div>
              </motion.div>
            ))}
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

          {/* Call to Action */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à commencer votre apprentissage ?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Inscrivez-vous dès maintenant pour accéder à toutes nos formations et 
              bénéficier de l'accompagnement de nos experts.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Créer mon compte gratuitement
            </button>
          </div>
        </div>
      </div>

      {/* Modal simple avec backdrop flouté */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop avec blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-white/30 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200"
            >
              {/* Bouton fermer */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Contenu du modal */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineBadgeCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Rejoignez-nous !
                </h2>
                <p className="text-gray-600">
                  {selectedFormation 
                    ? `Connectez-vous ou créez un compte pour accéder à "${selectedFormation.title}"`
                    : 'Connectez-vous ou créez un compte pour accéder à nos formations'
                  }
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Créer un compte
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </button>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500 text-center mt-6">
                L'inscription est gratuite et ne prend que quelques minutes
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FormationPublique;