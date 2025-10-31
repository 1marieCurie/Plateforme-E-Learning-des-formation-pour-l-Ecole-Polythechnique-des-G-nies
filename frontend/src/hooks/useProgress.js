// src/hooks/useProgress.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useProgress = () => {
  const [formationProgress, setFormationProgress] = useState([]);
  const [chapterProgress, setChapterProgress] = useState([]);
  const [categoryProgress, setCategoryProgress] = useState([]);
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

  // Récupérer le progrès global de l'utilisateur
  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir votre progrès.');
      }

      const response = await fetch('/api/user/progress', {
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
      
      setFormationProgress(Array.isArray(data.formations) ? data.formations : []);
      setChapterProgress(Array.isArray(data.chapters) ? data.chapters : []);
      setCategoryProgress(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      console.error('Erreur lors du chargement du progrès:', error);
      setError(error.message);
      setFormationProgress([]);
      setChapterProgress([]);
      setCategoryProgress([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le progrès pour une formation spécifique
  const fetchFormationProgress = async (formationId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formations/${formationId}/progress`, {
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
      console.error('Erreur lors du chargement du progrès de formation:', error);
      throw error;
    }
  };

  // Marquer un chapitre comme complété
  const markChapterCompleted = async (chapterId, completed = true) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = { 
        is_read: completed, // Utiliser 'is_read' au lieu de 'completed'
        last_read_at: completed ? new Date().toISOString() : null,
        first_read_at: completed ? new Date().toISOString() : null
      };

      const response = await fetch(`/api/chapters/${chapterId}/progress`, {
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
      
      // Recharger le progrès
      await fetchUserProgress();
      
      toast.success(completed ? 'Chapitre marqué comme complété !' : 'Progression du chapitre mise à jour');
      return result;
    } catch (error) {
      console.error('Erreur progression chapitre:', error);
      toast.error('Erreur lors de la mise à jour du progrès');
      throw error;
    }
  };

  // Mettre à jour le progrès d'une formation
  const updateFormationProgress = async (formationId, progressData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formations/${formationId}/progress`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
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
      
      // Recharger le progrès
      await fetchUserProgress();
      
      return result;
    } catch (error) {
      console.error('Erreur mise à jour progrès formation:', error);
      throw error;
    }
  };

  // Calculer le pourcentage de progression d'une formation
  const calculateFormationProgress = (formationId) => {
    const progress = formationProgress.find(p => p.formation_id === formationId);
    if (!progress) return 0;
    
    return Math.round((progress.completed_chapters / progress.total_chapters) * 100) || 0;
  };

  // Vérifier si un chapitre est complété
  const isChapterCompleted = (chapterId) => {
    return chapterProgress.some(progress => 
      progress.chapter_id === chapterId && progress.is_read // Utiliser 'is_read' au lieu de 'completed'
    );
  };

  // Obtenir le progrès d'une catégorie
  const getCategoryProgress = (categoryId) => {
    return categoryProgress.find(progress => progress.category_id === categoryId) || {
      category_id: categoryId,
      completed_formations: 0,
      total_formations: 0,
      progress_percentage: 0
    };
  };

  // Récupérer les statistiques de progrès pour admin/enseignant
  const fetchProgressStats = async (formationId = null) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const url = formationId 
        ? `/api/formations/${formationId}/stats`
        : '/api/progress/stats';

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
      throw error;
    }
  };

  // Réinitialiser le progrès d'une formation
  const resetFormationProgress = async (formationId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/formations/${formationId}/progress/reset`, {
        method: 'POST',
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

      // Recharger le progrès
      await fetchUserProgress();
      
      toast.success('Progrès réinitialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur réinitialisation progrès:', error);
      toast.error('Erreur lors de la réinitialisation');
      throw error;
    }
  };

  // Charger le progrès au montage du composant
  useEffect(() => {
    if (isLoggedIn()) {
      fetchUserProgress();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    formationProgress,
    chapterProgress,
    categoryProgress,
    loading,
    error,
    fetchUserProgress,
    fetchFormationProgress,
    markChapterCompleted,
    updateFormationProgress,
    calculateFormationProgress,
    isChapterCompleted,
    getCategoryProgress,
    fetchProgressStats,
    resetFormationProgress
  };
};

export default useProgress;
