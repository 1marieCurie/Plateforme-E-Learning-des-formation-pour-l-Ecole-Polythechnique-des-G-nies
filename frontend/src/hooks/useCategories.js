// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonctions utilitaires pour l'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  // Récupérer toutes les catégories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/categories', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setError(error.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les formations d'une catégorie
  const getCategoryFormations = async (categoryId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/categories/${categoryId}/formations`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Erreur lors du chargement des formations de la catégorie:', error);
      toast.error('Erreur lors du chargement des formations');
      throw error;
    }
  };

  // Créer une nouvelle catégorie
  const createCategory = async (categoryData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = {
        nom: categoryData.name || categoryData.nom,
        description: categoryData.description
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adaptedData)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.errors || errorData.error)}`);
      }

      const result = await response.json();
      
      // Recharger les catégories
      await fetchCategories();
      
      toast.success('Catégorie créée avec succès');
      return result;
    } catch (error) {
      console.error('Erreur création catégorie:', error);
      toast.error('Erreur lors de la création de la catégorie');
      throw error;
    }
  };

  // Mettre à jour une catégorie
  const updateCategory = async (id, categoryData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = {
        nom: categoryData.name || categoryData.nom,
        description: categoryData.description
      };

      // Supprimer les champs undefined
      Object.keys(adaptedData).forEach(key => {
        if (adaptedData[key] === undefined) {
          delete adaptedData[key];
        }
      });

      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adaptedData)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.errors || errorData.error)}`);
      }

      const result = await response.json();
      
      // Recharger les catégories
      await fetchCategories();
      
      toast.success('Catégorie mise à jour avec succès');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour catégorie:', error);
      toast.error('Erreur lors de la mise à jour de la catégorie');
      throw error;
    }
  };

  // Supprimer une catégorie
  const deleteCategory = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.error || errorData.message)}`);
      }

      // Recharger les catégories
      await fetchCategories();
      
      toast.success('Catégorie supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression catégorie:', error);
      toast.error('Erreur lors de la suppression de la catégorie');
      throw error;
    }
  };

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoryFormations,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export default useCategories;
