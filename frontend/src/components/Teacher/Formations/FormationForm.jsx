/* eslint-disable no-unused-vars */
// src/components/Teacher/Formations/FormationForm.jsx

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const FormationForm = ({ courses, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    duration_hours: '',
    difficulty_level: 'debutant'
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error('Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      // Pour l'instant, envoyons en JSON (nous gérerons l'upload d'image plus tard)
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        price: formData.price || '0',
        duration_hours: formData.duration_hours || '1',
        difficulty_level: formData.difficulty_level
      };

      console.log('FormationForm - Data to send:', dataToSend);

      await onSubmit(dataToSend);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la formation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Créer une nouvelle formation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la formation *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            {loadingCategories ? (
              <div className="text-gray-500">Chargement des catégories...</div>
            ) : (
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nom}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (€)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (heures)
            </label>
            <input
              type="number"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Niveau de difficulté */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de difficulté
            </label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {loading ? 'Création...' : 'Créer la formation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormationForm;
