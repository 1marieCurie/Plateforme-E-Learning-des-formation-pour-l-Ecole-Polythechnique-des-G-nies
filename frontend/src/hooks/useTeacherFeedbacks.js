// src/hooks/useTeacherFeedbacks.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useTeacherFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
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

  // Récupérer tous les feedbacks du formateur connecté
  const fetchMyFeedbacks = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les feedbacks.');
      }

      const queryParams = new URLSearchParams();
      if (filters.formation_id) queryParams.append('formation_id', filters.formation_id);
      if (filters.student_id) queryParams.append('student_id', filters.student_id);
      if (filters.feedback_type) queryParams.append('feedback_type', filters.feedback_type);
      if (filters.status) queryParams.append('status', filters.status);

      // ⚠️ ROUTE API MANQUANTE - Utiliser une route temporaire
      const url = `/api/my-teacher-feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
      setError(error.message);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les feedbacks d'un étudiant spécifique
  const fetchStudentFeedbacks = async (studentId, formationId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les feedbacks.');
      }

      const queryParams = new URLSearchParams();
      if (formationId) queryParams.append('formation_id', formationId);

      const url = `/api/students/${studentId}/feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks de l\'étudiant:', error);
      setError(error.message);
      throw error;
    }
  };

  // Créer un nouveau feedback
  const createFeedback = async (feedbackData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = {
        student_id: feedbackData.student_id,
        formation_id: feedbackData.formation_id,
        rating: feedbackData.rating, // Note globale 1-5
        title: feedbackData.title,
        message: feedbackData.message,
        participation_rating: feedbackData.participation_rating,
        progress_rating: feedbackData.progress_rating,
        commitment_rating: feedbackData.commitment_rating,
        technical_skills_rating: feedbackData.technical_skills_rating,
        recommendations: feedbackData.recommendations,
        strengths: feedbackData.strengths,
        areas_for_improvement: feedbackData.areas_for_improvement,
        is_private: feedbackData.is_private !== undefined ? feedbackData.is_private : true,
        feedback_type: feedbackData.feedback_type || 'progress', // progress, encouragement, warning, recommendation, milestone
        status: feedbackData.status || 'sent' // draft, sent, read
      };

      const response = await fetch('/api/teacher-feedbacks', {
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
      
      // Recharger les feedbacks
      await fetchMyFeedbacks();
      
      toast.success('Feedback créé avec succès');
      return result;
    } catch (error) {
      console.error('Erreur création feedback:', error);
      toast.error('Erreur lors de la création du feedback');
      throw error;
    }
  };

  // Mettre à jour un feedback
  const updateFeedback = async (id, feedbackData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = {
        rating: feedbackData.rating,
        title: feedbackData.title,
        message: feedbackData.message,
        participation_rating: feedbackData.participation_rating,
        progress_rating: feedbackData.progress_rating,
        commitment_rating: feedbackData.commitment_rating,
        technical_skills_rating: feedbackData.technical_skills_rating,
        recommendations: feedbackData.recommendations,
        strengths: feedbackData.strengths,
        areas_for_improvement: feedbackData.areas_for_improvement,
        is_private: feedbackData.is_private,
        feedback_type: feedbackData.feedback_type,
        status: feedbackData.status
      };

      // Supprimer les champs undefined
      Object.keys(adaptedData).forEach(key => {
        if (adaptedData[key] === undefined) {
          delete adaptedData[key];
        }
      });

      const response = await fetch(`/api/teacher-feedbacks/${id}`, {
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
      
      // Recharger les feedbacks
      await fetchMyFeedbacks();
      
      toast.success('Feedback mis à jour avec succès');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour feedback:', error);
      toast.error('Erreur lors de la mise à jour du feedback');
      throw error;
    }
  };

  // Supprimer un feedback
  const deleteFeedback = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/teacher-feedbacks/${id}`, {
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

      // Recharger les feedbacks
      await fetchMyFeedbacks();
      
      toast.success('Feedback supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression feedback:', error);
      toast.error('Erreur lors de la suppression du feedback');
      throw error;
    }
  };

  // Marquer un feedback comme lu (côté étudiant)
  const markAsRead = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/teacher-feedbacks/${id}/read`, {
        method: 'PATCH',
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
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.error || errorData.message)}`);
      }

      // Recharger les feedbacks
      await fetchMyFeedbacks();
      
      return true;
    } catch (error) {
      console.error('Erreur marquage lecture feedback:', error);
      throw error;
    }
  };

  // Obtenir les statistiques des feedbacks
  const getFeedbackStats = async (formationId = null) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les statistiques.');
      }

      const queryParams = new URLSearchParams();
      if (formationId) queryParams.append('formation_id', formationId);

      const url = `/api/teacher-feedbacks/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError(error.message);
      throw error;
    }
  };

  // Envoyer un feedback en masse à plusieurs étudiants
  const sendBulkFeedback = async (feedbackData, studentIds) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const bulkData = {
        student_ids: studentIds,
        ...feedbackData
      };

      const response = await fetch('/api/teacher-feedbacks/bulk', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkData)
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
      
      // Recharger les feedbacks
      await fetchMyFeedbacks();
      
      toast.success(`Feedback envoyé à ${studentIds.length} étudiant(s) avec succès`);
      return result;
    } catch (error) {
      console.error('Erreur envoi feedback en masse:', error);
      toast.error('Erreur lors de l\'envoi du feedback en masse');
      throw error;
    }
  };

  // Récupérer un feedback spécifique
  const getFeedback = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir ce feedback.');
      }

      const response = await fetch(`/api/teacher-feedbacks/${id}`, {
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
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du feedback:', error);
      setError(error.message);
      throw error;
    }
  };

  // Charger les feedbacks au montage du composant
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'formateur') {
      fetchMyFeedbacks();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    feedbacks,
    loading,
    error,
    fetchMyFeedbacks,
    fetchStudentFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    markAsRead,
    getFeedbackStats,
    sendBulkFeedback,
    getFeedback
  };
};

export default useTeacherFeedbacks;
