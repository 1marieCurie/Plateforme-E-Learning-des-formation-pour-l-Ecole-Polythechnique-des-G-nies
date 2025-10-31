// src/components/Teacher/Formations/EditFormationPanel.jsx
import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const EditFormationPanel = ({ formation, onClose, onSave }) => {
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

  // Initialiser les données quand la formation est chargée
  useEffect(() => {
    if (formation) {
      setFormData({
        title: formation.title || '',
        description: formation.description || '',
        category_id: formation.category_id || '',
        price: formation.price || '',
        duration_hours: formation.duration_hours || '',
        difficulty_level: formation.difficulty_level || 'debutant'
      });
    }
  }, [formation]);

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
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        price: formData.price || '0',
        duration_hours: formData.duration_hours || '1',
        difficulty_level: formData.difficulty_level
      };

      console.log('EditFormationPanel - Data to send:', dataToSend);

      await onSave(formation.id, dataToSend);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Modifier la formation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre de la formation *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie *</label>
            {loadingCategories ? (
              <div className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md bg-gray-50">
                Chargement des catégories...
              </div>
            ) : (
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nom}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Durée (heures)</label>
            <input
              type="number"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: 10"
            />
          </div>

          {/* Niveau de difficulté */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Niveau de difficulté</label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFormationPanel;
