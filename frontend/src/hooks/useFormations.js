/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
// src/hooks/useFormations.js
import { useState, useEffect } from 'react';

export const useFormations = () => {
  const [formations, setFormations] = useState([]);
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

  // Récupérer les formations de l'étudiant connecté via ses inscriptions
  const fetchFormations = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir vos formations.');
      }
      // Détecter le rôle utilisateur
      let role = null;
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        role = user?.role;
      } catch (e) {}

      let url = '/api/user/enrollments'; // par défaut étudiant
      if (role === 'formateur' || role === 'super_admin') {
        url = '/api/my-formations'; // adapte selon ta route backend
      }

      const response = await fetch(url, {
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
      console.log('[useFormations] Réponse API', url, ':', data);
      let formationsList = [];
      if (role === 'formateur') {
        // On attend un tableau de formations directement
        if (Array.isArray(data)) {
          formationsList = data;
        } else if (Array.isArray(data.data)) {
          formationsList = data.data;
        }
      } else {
        // étudiant : mapping via enrollments
        if (Array.isArray(data)) {
          formationsList = data
            .map(enrollment => enrollment.formation)
            .filter(f => !!f && typeof f === 'object' && f.id);
        } else if (Array.isArray(data.data)) {
          formationsList = data.data
            .map(enrollment => enrollment.formation)
            .filter(f => !!f && typeof f === 'object' && f.id);
        }
      }
      setFormations(formationsList);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      setError(error.message);
      setFormations([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle formation
  const createFormation = async (formationData) => {
    try {
      console.log("useFormations - createFormation:", formationData);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Déterminer si c'est FormData ou JSON
      const isFormData = formationData instanceof FormData;
      
      const headers = {
        ...getAuthHeaders()
      };
      
      // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch('/api/formations', {
        method: 'POST',
        headers: headers,
        body: isFormData ? formationData : JSON.stringify(formationData)
      });

      console.log("useFormations - Réponse création:", response.status);

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("useFormations - Erreurs de validation:", errorData);
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.errors || errorData.error)}`);
      }

      const result = await response.json();
      console.log("useFormations - Formation créée:", result);
      
      // Recharger les formations
      await fetchFormations();
      
      return result;
    } catch (error) {
      console.error("useFormations - Erreur création:", error);
      throw error;
    }
  };

  // Mettre à jour une formation
  const updateFormation = async (id, formationData) => {
    try {
      console.log("useFormations - updateFormation:", id, formationData);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formations/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formationData)
      });

      console.log("useFormations - Réponse mise à jour:", response.status);

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("useFormations - Erreurs de validation:", errorData);
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.errors || errorData.error)}`);
      }

      const result = await response.json();
      console.log("useFormations - Formation mise à jour:", result);
      
      // Recharger les formations
      await fetchFormations();
      
      return result;
    } catch (error) {
      console.error("useFormations - Erreur mise à jour:", error);
      throw error;
    }
  };

  // Supprimer une formation
  const deleteFormation = async (id) => {
    try {
      console.log("useFormations - deleteFormation:", id);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      console.log("useFormations - Réponse suppression:", response.status);

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("useFormations - Erreur suppression:", errorData);
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.error || errorData.message)}`);
      }

      console.log("useFormations - Formation supprimée avec succès");
      
      // Recharger les formations
      await fetchFormations();
      
      return true;
    } catch (error) {
      console.error("useFormations - Erreur suppression:", error);
      throw error;
    }
  };

  // Charger les formations au montage du composant
  useEffect(() => {
    fetchFormations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    formations,
    loading,
    error,
    fetchFormations,
    createFormation,
    updateFormation,
    deleteFormation
  };
};

export default useFormations;
