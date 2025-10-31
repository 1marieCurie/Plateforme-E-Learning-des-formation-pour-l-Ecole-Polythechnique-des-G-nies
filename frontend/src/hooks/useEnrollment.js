// src/hooks/useEnrollment.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useEnrollment = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
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



  // Récupérer les inscriptions d'un utilisateur
  const fetchUserEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir vos inscriptions.');
      }

      const response = await fetch('/api/user/enrollments', {
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
      setUserEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
      setError(error.message);
      setUserEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer toutes les inscriptions (pour admin/enseignant)
  const fetchAllEnrollments = async (formationId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const url = formationId 
        ? `/api/formations/${formationId}/formation-enrollments` // Utiliser le bon endpoint
        : '/api/formation-enrollments'; // Utiliser le bon endpoint

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
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error);
      setError(error.message);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  // S'inscrire à une formation
  const enrollToFormation = async (formationId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour vous inscrire.');
      }

      const response = await fetch('/api/formation-enrollments', { // Utiliser le bon endpoint
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formation_id: formationId })
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
      
      // Recharger les inscriptions de l'utilisateur
      await fetchUserEnrollments();
      
      toast.success('Inscription réussie !');
      return result;
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast.error('Erreur lors de l\'inscription');
      throw error;
    }
  };

  // Se désinscrire d'une formation
  const unenrollFromFormation = async (enrollmentId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formation-enrollments/${enrollmentId}`, { // Utiliser le bon endpoint
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

      // Recharger les inscriptions de l'utilisateur
      await fetchUserEnrollments();
      
      toast.success('Désinscription réussie');
      return true;
    } catch (error) {
      console.error('Erreur désinscription:', error);
      toast.error('Erreur lors de la désinscription');
      throw error;
    }
  };

  // Mettre à jour le statut d'une inscription (pour admin/enseignant)
  const updateEnrollmentStatus = async (id, status) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formation-enrollments/${id}/status`, { // Utiliser le bon endpoint
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
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
      
      // Recharger les inscriptions
      await fetchAllEnrollments();
      
      toast.success('Statut d\'inscription mis à jour');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
      throw error;
    }
  };

  // Vérifier si l'utilisateur est inscrit à une formation
  const isEnrolledToFormation = (formationId) => {
    return userEnrollments.some(enrollment => 
      enrollment.formation_id === formationId && 
      enrollment.status === 'active'
    );
  };

  // Obtenir l'inscription d'un utilisateur pour une formation
  const getEnrollmentForFormation = (formationId) => {
    return userEnrollments.find(enrollment => 
      enrollment.formation_id === formationId
    );
  };

  // Charger les inscriptions de l'utilisateur au montage
  useEffect(() => {
    if (isLoggedIn()) {
      fetchUserEnrollments();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    enrollments,
    userEnrollments,
    loading,
    error,
    fetchUserEnrollments,
    fetchAllEnrollments,
    enrollToFormation,
    unenrollFromFormation,
    updateEnrollmentStatus,
    isEnrolledToFormation,
    getEnrollmentForFormation
  };
};

export default useEnrollment;
