// src/hooks/useChapters.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useChapters = (courseId = null) => {
  const [chapters, setChapters] = useState([]);
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

  // Récupérer les chapitres d'un cours
  const fetchChapters = useCallback(async (specificCourseId = null, userRole = null) => {
    const targetCourseId = specificCourseId || courseId;
    if (!targetCourseId) {
      setChapters([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les chapitres.');
      }
      // Déterminer la route selon le rôle
      let route = `/api/courses/${targetCourseId}/chapters`;
      let user = null;
      try {
        user = JSON.parse(localStorage.getItem('user'));
      } catch { /* empty */ }
      const role = userRole || (user && user.role);
      if (role === 'formateur' || role === 'admin' || role === 'super_admin') {
        route = `/api/courses/${targetCourseId}/chapters/manage`;
      }
      const response = await fetch(route, {
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
        throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }
      const data = await response.json();
      const chaptersArray = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      setChapters(chaptersArray);
    } catch (error) {
      console.error('Erreur lors du chargement des chapitres:', error);
      setError(error.message);
      setChapters([]);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Créer un nouveau chapitre avec gestion complète des fichiers
  const createChapter = (chapterData, onProgress) => {
    return new Promise((resolve, reject) => {
      if (!isLoggedIn()) {
        reject(new Error('Vous devez être connecté pour effectuer cette action.'));
        return;
      }

      // Validation des données
      if (!chapterData.title && !chapterData.titre) {
        reject(new Error('Le titre du chapitre est requis.'));
        return;
      }

      if (!chapterData.course_id && !courseId) {
        reject(new Error('L\'ID du cours est requis.'));
        return;
      }

      const formData = new FormData();
      
      // Ajout des données du chapitre
      formData.append('titre', chapterData.title || chapterData.titre);
      formData.append('description', chapterData.description || '');
      formData.append('course_id', chapterData.course_id || courseId);
      // Ajout des champs supplémentaires si présents
      if (chapterData.order_index !== undefined) {
        formData.append('order_index', chapterData.order_index);
      }
      if (chapterData.duration_minutes !== undefined) {
        formData.append('duration_minutes', chapterData.duration_minutes);
      }
      if (chapterData.is_active !== undefined) {
        formData.append('is_active', chapterData.is_active);
      }
      // Ajout du fichier si présent
      if (chapterData.file) {
        formData.append('file', chapterData.file);
      }
      // Ajout de la vidéo si présente
      if (chapterData.video_url) {
        formData.append('video_url', chapterData.video_url);
      } else if (chapterData.video) {
        formData.append('video_url', chapterData.video);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/chapters', true);
      
      // Headers d'authentification
      const headers = getAuthHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // Gestion de la progression d'upload
      xhr.upload.onprogress = function (event) {
        if (event.lengthComputable && typeof onProgress === 'function') {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      // Gestion du succès
      xhr.onload = function () {
        try {
          if (xhr.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            reject(new Error('Session expirée. Veuillez vous reconnecter.'));
            return;
          }

          if (xhr.status < 200 || xhr.status >= 300) {
            let errorMessage = `Erreur HTTP: ${xhr.status}`;
            let errorData = {};
            
            try {
              errorData = JSON.parse(xhr.responseText);
              if (errorData.errors) {
                // Erreurs de validation Laravel
                const validationErrors = Object.values(errorData.errors).flat();
                errorMessage = validationErrors.join(', ');
              } else if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (parseError) {
              console.error('Erreur lors du parsing de la réponse:', parseError);
            }
            
            reject(new Error(errorMessage));
            return;
          }

          let result = {};
          try {
            result = JSON.parse(xhr.responseText);
          } catch (parseError) {
            console.error('Erreur lors du parsing du succès:', parseError);
            result = {};
          }

          // Recharger les chapitres
          const refreshCourseId = chapterData.course_id || courseId;
          if (refreshCourseId) {
            fetchChapters(refreshCourseId);
          }

          resolve(result);
        } catch (error) {
          reject(new Error('Erreur lors du traitement de la réponse: ' + error.message));
        }
      };

      // Gestion des erreurs réseau
      xhr.onerror = function () {
        reject(new Error('Erreur réseau lors de la création du chapitre'));
      };

      // Gestion du timeout
      xhr.ontimeout = function () {
        reject(new Error('Timeout lors de l\'upload du chapitre'));
      };

      // Définir un timeout de 5 minutes pour les gros fichiers
      xhr.timeout = 300000; // 5 minutes

      // Envoi de la requête
      xhr.send(formData);
    });
  };

  // Mettre à jour un chapitre
  const updateChapter = async (id, chapterData) => {
    // Nouvelle version avec gestion de fichier et progression
    return new Promise((resolve, reject) => {
      if (!isLoggedIn()) {
        reject(new Error('Vous devez être connecté pour effectuer cette action.'));
        return;
      }

      const formData = new FormData();
      formData.append('titre', chapterData.title || chapterData.titre);
      formData.append('description', chapterData.description || '');
      if (chapterData.file) {
        formData.append('file', chapterData.file);
      }
      if (chapterData.video_url) {
        formData.append('video_url', chapterData.video_url);
      } else if (chapterData.video) {
        formData.append('video_url', chapterData.video);
      }
      if (chapterData.order_index !== undefined) {
        formData.append('order_index', chapterData.order_index);
      }
      if (chapterData.duration_minutes !== undefined) {
        formData.append('duration_minutes', chapterData.duration_minutes);
      }
      if (chapterData.is_active !== undefined) {
        formData.append('is_active', chapterData.is_active);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/chapters/${id}?_method=PUT`, true); // Laravel supporte _method

      // Headers d'authentification
      const headers = getAuthHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      // Gestion de la progression d'upload
      if (typeof chapterData.onProgress === 'function') {
        xhr.upload.onprogress = function (event) {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            chapterData.onProgress(percent);
          }
        };
      }

      xhr.onload = function () {
        try {
          if (xhr.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            reject(new Error('Session expirée. Veuillez vous reconnecter.'));
            return;
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            let errorMessage = `Erreur HTTP: ${xhr.status}`;
            let errorData = {};
            try {
              errorData = JSON.parse(xhr.responseText);
              if (errorData.errors) {
                const validationErrors = Object.values(errorData.errors).flat();
                errorMessage = validationErrors.join(', ');
              } else if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            } catch (parseError) {
              console.error('Erreur lors du parsing de la réponse:', parseError);
            }
            reject(new Error(errorMessage));
            return;
          }
          let result = {};
          try {
            result = JSON.parse(xhr.responseText);
          } catch (parseError) {
            console.error('Erreur lors du parsing du succès:', parseError);
            result = {};
          }
          // Recharger les chapitres
          const refreshCourseId = chapterData.course_id || courseId;
          if (refreshCourseId) {
            fetchChapters(refreshCourseId);
          }
          resolve(result);
        } catch (error) {
          reject(new Error('Erreur lors du traitement de la réponse: ' + error.message));
        }
      };
      xhr.onerror = function () {
        reject(new Error('Erreur réseau lors de la mise à jour du chapitre'));
      };
      xhr.ontimeout = function () {
        reject(new Error('Timeout lors de l\'upload du chapitre'));
      };
      xhr.timeout = 300000; // 5 minutes
      xhr.send(formData);
    });
  };

  // Supprimer un chapitre
  const deleteChapter = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/chapters/${id}`, {
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
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        throw new Error(errorMessage);
      }

      // Recharger les chapitres avec le courseId correct
      if (courseId) {
        await fetchChapters(courseId);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur suppression chapitre:', error);
      toast.error(error.message || 'Erreur lors de la suppression du chapitre');
      throw error;
    }
  };

  // Réorganiser les chapitres
  const reorderChapters = async (chapterIds) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/courses/${courseId}/chapters/reorder`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chapter_ids: chapterIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.error || errorData.message)}`);
      }

      // Recharger les chapitres
      await fetchChapters();
      
      toast.success('Ordre des chapitres mis à jour');
      return true;
    } catch (error) {
      console.error('Erreur réorganisation chapitres:', error);
      toast.error('Erreur lors de la réorganisation');
      throw error;
    }
  };

  // Charger les chapitres au montage du composant si courseId est fourni
  useEffect(() => {
    if (courseId) {
      fetchChapters();
    }
  }, [courseId, fetchChapters]);

  return {
    chapters,
    loading,
    error,
    fetchChapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters
  };
};

export default useChapters;