/* eslint-disable no-unused-vars */
// src/pages/Teacher/Formations.jsx

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import FormationCard from "@/components/Teacher/Formations/FormationCard";
import FormationForm from "@/components/Teacher/Formations/FormationForm";
import SearchBar from "@/components/Teacher/Formations/SearchBar"; 
import EditFormationPanel from "@/components/Teacher/Formations/EditFormationPanel";
import { useFormations } from "@/hooks/useFormations";
import { toast } from "react-toastify";

import { pythonImg, reactImg, webImg, marketingImg } from "@/assets";

const Formations = () => {
  // Utiliser le hook useFormations pour récupérer les vraies données
  const { formations, loading, error, createFormation, updateFormation, deleteFormation, fetchFormations } = useFormations();
  
  const allCourses = [
    {
      id: 1,
      title: "Python Débutant",
      description: "Introduction à la programmation avec Python.",
      image: pythonImg,
      students: 12,
    },
    {
      id: 2,
      title: "React Avancé",
      description: "Composants, hooks et gestion d'état avancée.",
      image: reactImg,
      students: 18,
    },
  ];

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrer les formations en fonction du nom
  const filteredFormations = formations.filter((formation) =>
    formation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFormation = async (newFormationData) => {
    try {
      await createFormation(newFormationData);
      await fetchFormations(); // Rafraîchir la liste après création
      setIsFormVisible(false);
      toast.success("Formation créée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création de la formation");
    }
  };

  const handleDeleteFormation = async (formationId) => {
    try {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
        await deleteFormation(formationId);
        toast.success("Formation supprimée avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de la formation");
    }
  };

  const handleUpdateFormation = async (formationId, updatedData) => {
    try {
      await updateFormation(formationId, updatedData);
      toast.success("Formation mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour de la formation");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-gray-800">Formations</h2>

      {/* État de chargement */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Chargement des formations...</span>
        </div>
      )}

      {/* Gestion des erreurs */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Interface normale si pas de chargement */}
      {!loading && (
        <>
          {/* Section de recherche et bouton d'ajout */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
            <div className="flex-1">
                <SearchBar searchQuery={searchQuery} onSearch={setSearchQuery} />
            </div>

            <button
                onClick={() => setIsFormVisible(true)}
                className="flex items-center justify-center gap-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition"
            >
                + Ajouter une formation
            </button>
          </div>

          {/* Affichage du formulaire d'ajout de formation */}
          {isFormVisible && (
            <FormationForm
              courses={allCourses}
              onSubmit={handleAddFormation}
              onClose={() => setIsFormVisible(false)}
            />
          )}

          {/* Affichage des formations filtrées */}
          <h2 className="text-2xl flex p-5 items-start font-bold text-gray-800">Mes Formations</h2>
          
          {filteredFormations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">
                {formations.length === 0 
                  ? "Vous n'avez pas encore créé de formations" 
                  : "Aucune formation ne correspond à votre recherche"
                }
              </div>
              {formations.length === 0 && (
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Créer ma première formation
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredFormations.map((formation) => (
                  <FormationCard
                  key={formation.id}
                  formation={formation}
                  onDelete={handleDeleteFormation}
                  onUpdate={handleUpdateFormation}
                  availableCourses={allCourses}
                  />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Formations;
