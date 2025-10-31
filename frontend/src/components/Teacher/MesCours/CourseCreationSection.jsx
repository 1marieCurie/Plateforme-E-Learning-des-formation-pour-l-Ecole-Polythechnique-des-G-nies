// src/components/Teacher/MesCours/CourseCreationSection.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiVideo } from "react-icons/fi";
import { useFormations } from "@/hooks/useFormations";
import { useCategories } from "@/hooks/useCategories";

const CourseCreationSection = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formationId, setFormationId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Charger les valeurs sauvegardées au montage
  useEffect(() => {
    // Charger le brouillon UNIQUEMENT si le formulaire est ouvert
    const saved = localStorage.getItem("courseFormDraft");
    if (saved) {
      const draft = JSON.parse(saved);
      if (draft) {
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setFormationId(draft.formationId || "");
        setCategoryId(draft.categoryId || "");
      }
    }
  }, []);

  // Sauvegarder à chaque modification
  useEffect(() => {
    // Sauvegarder le brouillon à chaque modification
    const draft = { title, description, formationId, categoryId };
    // Ne sauvegarder que si au moins un champ est rempli
    if (title || description || formationId || categoryId) {
      localStorage.setItem("courseFormDraft", JSON.stringify(draft));
    }
  }, [title, description, formationId, categoryId]);

  const { formations, loading: loadingFormations, error: errorFormations } = useFormations();
  const { categories, loading: loadingCategories, error: errorCategories } = useCategories();

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !formationId || !categoryId) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        formation_id: formationId,
        category_id: categoryId
      });

      toast.success("Cours créé avec succès !", {
        position: "top-right",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: '#22c55e', color: 'white', fontWeight: 'bold', fontSize: '1rem' }
      });

      // Réinitialiser le formulaire après succès
      setTitle("");
      setDescription("");
      setFormationId("");
      setCategoryId("");
      localStorage.removeItem("courseFormDraft");
    } catch (error) {
      // L'erreur sera gérée par le hook useCourses
      console.error('CourseCreationSection: Erreur lors de la création du cours:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md border border-indigo-100 overflow-hidden relative"
    >
      {/* Bouton de fermeture (croix) */}
      {onClose && (
        <button
          type="button"
          className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none z-10"
          style={{ transform: 'translateY(-50%)' }}
          onClick={() => {
            // Sauvegarder le brouillon avant fermeture
            const draft = { title, description, formationId, categoryId };
            if (title || description || formationId || categoryId) {
              localStorage.setItem("courseFormDraft", JSON.stringify(draft));
            }
            onClose();
          }}
          aria-label="Fermer"
        >
          &times;
        </button>
      )}
      {/* Header bleu avec titre centré et bouton effacer le brouillon */}
      <div className="bg-indigo-600 text-white p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FiVideo className="text-3xl" />
          <h2 className="text-2xl font-bold">Ajouter un nouveau cours</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-indigo-800 hover:bg-indigo-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors shadow-lg border border-indigo-900"
            style={{ minWidth: '140px' }}
            onClick={() => {
              setTitle("");
              setDescription("");
              setFormationId("");
              setCategoryId("");
              localStorage.removeItem("courseFormDraft");
            }}
          >
            Effacer le brouillon
          </button>
        </div>
      </div>

      {/* Contenu du formulaire */}
      <div className="p-6 space-y-6">
        {/* Titre du cours */}
        <input
          type="text"
          placeholder="Titre du cours (ex: Introduction à React)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          required
        />

        {/* Description */}
        <textarea
          placeholder="Description du cours..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          required
        />

        {/* Sélection de la formation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formation <span className="text-red-500">*</span>
          </label>
          {errorFormations && (
            <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              Erreur lors du chargement des formations : {errorFormations}
            </div>
          )}
          <select
            value={formationId}
            onChange={(e) => setFormationId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            required
          >
            <option value="">Sélectionner une formation</option>
            {loadingFormations ? (
              <option disabled>Chargement des formations...</option>
            ) : formations.length === 0 ? (
              <option disabled>Aucune formation disponible</option>
            ) : (
              formations.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))
            )}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            {formations.length} formation(s) disponible(s)
          </div>
        </div>

        {/* Sélection de la catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie <span className="text-red-500">*</span>
          </label>
          {errorCategories && (
            <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              Erreur lors du chargement des catégories : {errorCategories}
            </div>
          )}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            required
          >
            <option value="">Sélectionner une catégorie</option>
            {loadingCategories ? (
              <option disabled>Chargement des catégories...</option>
            ) : categories.length === 0 ? (
              <option disabled>Aucune catégorie disponible</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))
            )}
          </select>
          <div className="mt-1 text-xs text-gray-500">
            {categories.length} catégorie(s) disponible(s)
          </div>
        </div>

        {/* Bouton envoyer */}
        <div className="text-right pt-4 border-t">
          <button
            type="submit"
            disabled={!title || !description || !formationId || !categoryId || submitting}
            className={`bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded font-medium transition-colors ${submitting ? 'opacity-70' : ''}`}
          >
            {submitting ? 'Création en cours...' : 'Créer le cours'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CourseCreationSection;
