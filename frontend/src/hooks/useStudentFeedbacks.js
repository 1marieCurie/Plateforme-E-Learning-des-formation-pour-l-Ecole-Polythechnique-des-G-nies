// src/hooks/useStudentFeedbacks.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useStudentFeedbacks = () => {
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

  // Récupérer tous les feedbacks de l'étudiant connecté
  const fetchMyFeedbacks = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir vos feedbacks.');
      }

      const queryParams = new URLSearchParams();
      if (filters.course_id) queryParams.append('course_id', filters.course_id);
      if (filters.teacher_id) queryParams.append('teacher_id', filters.teacher_id);
      if (filters.rating) queryParams.append('rating', filters.rating);

      // ⚠️ ROUTE API MANQUANTE - Utiliser une route temporaire
      const url = `/api/my-student-feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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

  // Récupérer les feedbacks d'un cours spécifique
  const fetchCourseFeedbacks = async (courseId, onlyPublic = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les feedbacks.');
      }

      const queryParams = new URLSearchParams();
      if (onlyPublic) queryParams.append('public_only', 'true');

      const url = `/api/courses/${courseId}/feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      console.error('Erreur lors du chargement des feedbacks du cours:', error);
      setError(error.message);
      throw error;
    }
  };

  // Récupérer les feedbacks d'un formateur
  const fetchTeacherFeedbacks = async (teacherId, onlyPublic = false) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les feedbacks.');
      }

      const queryParams = new URLSearchParams();
      if (onlyPublic) queryParams.append('public_only', 'true');

      const url = `/api/teachers/${teacherId}/feedbacks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
      console.error('Erreur lors du chargement des feedbacks du formateur:', error);
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
        teacher_id: feedbackData.teacher_id,
        course_id: feedbackData.course_id,
        rating: feedbackData.rating, // Note globale 1-5 (obligatoire)
        title: feedbackData.title,
        message: feedbackData.message, // Message principal (obligatoire)
        content_quality_rating: feedbackData.content_quality_rating,
        teaching_method_rating: feedbackData.teaching_method_rating,
        difficulty_level_rating: feedbackData.difficulty_level_rating,
        support_rating: feedbackData.support_rating,
        suggestions: feedbackData.suggestions,
        is_anonymous: feedbackData.is_anonymous !== undefined ? feedbackData.is_anonymous : false,
        is_public: feedbackData.is_public !== undefined ? feedbackData.is_public : false,
        status: feedbackData.status || 'approved' // pending, approved, rejected
      };

      const response = await fetch('/api/student-feedbacks', {
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

  // Mettre à jour un feedback (seulement si pas encore approuvé)
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
        content_quality_rating: feedbackData.content_quality_rating,
        teaching_method_rating: feedbackData.teaching_method_rating,
        difficulty_level_rating: feedbackData.difficulty_level_rating,
        support_rating: feedbackData.support_rating,
        suggestions: feedbackData.suggestions,
        is_anonymous: feedbackData.is_anonymous,
        is_public: feedbackData.is_public
      };

      // Supprimer les champs undefined
      Object.keys(adaptedData).forEach(key => {
        if (adaptedData[key] === undefined) {
          delete adaptedData[key];
        }
      });

      const response = await fetch(`/api/student-feedbacks/${id}`, {
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

      const response = await fetch(`/api/student-feedbacks/${id}`, {
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

  // Vérifier si l'étudiant a déjà donné un feedback pour un cours
  const hasFeedbackForCourse = async (courseId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette vérification.');
      }

      const response = await fetch(`/api/courses/${courseId}/my-feedback`, {
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

      if (response.status === 404) {
        return false; // Pas de feedback trouvé
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data ? data : false;
    } catch (error) {
      console.error('Erreur vérification feedback:', error);
      return false;
    }
  };

  // Obtenir les statistiques des feedbacks (pour admin/formateur)
  const getFeedbackStats = async (filters = {}) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les statistiques.');
      }

      const queryParams = new URLSearchParams();
      if (filters.course_id) queryParams.append('course_id', filters.course_id);
      if (filters.teacher_id) queryParams.append('teacher_id', filters.teacher_id);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);

      const url = `/api/student-feedbacks/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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

  // Modérer un feedback (admin seulement)
  const moderateFeedback = async (id, status, adminResponse = null) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/student-feedbacks/${id}/moderate`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status, // pending, approved, rejected
          admin_response: adminResponse
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (response.status === 403) {
        throw new Error('Accès refusé. Vous devez être administrateur.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.error || errorData.message)}`);
      }

      toast.success(`Feedback ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`);
      return true;
    } catch (error) {
      console.error('Erreur modération feedback:', error);
      toast.error('Erreur lors de la modération du feedback');
      throw error;
    }
  };

  // Récupérer un feedback spécifique
  const getFeedback = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir ce feedback.');
      }

      const response = await fetch(`/api/student-feedbacks/${id}`, {
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
    if (user.role === 'etudiant') {
      fetchMyFeedbacks();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    feedbacks,
    loading,
    error,
    fetchMyFeedbacks,
    fetchCourseFeedbacks,
    fetchTeacherFeedbacks,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    hasFeedbackForCourse,
    getFeedbackStats,
    moderateFeedback,
    getFeedback
  };
};

export default useStudentFeedbacks;
