// src/hooks/useAssignments.js
import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export const useAssignments = (courseId = null) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isLoggedIn } = useContext(AuthContext);

  // Récupérer tous les devoirs ou ceux d'un cours spécifique
  const fetchAssignments = async (specificCourseId = null) => {
    try {
      setLoading(true);
      setError(null);
      if (!isLoggedIn) {
        throw { message: 'Vous devez être connecté pour voir les devoirs.' };
      }
      const url = specificCourseId || courseId 
        ? `/courses/${specificCourseId || courseId}/assignments`
        : '/assignments';
      const response = await axiosInstance.get(url);
      const data = response.data;
      
      // Gestion des différents formats de réponse
      if (data.success !== undefined) {
        setAssignments(Array.isArray(data.data) ? data.data : []);
      } else {
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des devoirs:', error);
      setError(error?.response?.data?.message || error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error)));
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau devoir
  const createAssignment = async (assignmentData) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }
      const formData = new FormData();
      formData.append('title', assignmentData.title);
      formData.append('description', assignmentData.description || '');
      formData.append('type', assignmentData.type || 'tp');
      formData.append('course_id', assignmentData.course_id || courseId);
      formData.append('max_points', assignmentData.max_points || 20);
      
      // Formatage de la date
      if (assignmentData.due_date) {
        const dueDate = new Date(assignmentData.due_date).toISOString().slice(0, 19).replace('T', ' ');
        formData.append('due_date', dueDate);
      }
      
      formData.append('is_active', assignmentData.is_active ? 1 : 0);
      formData.append('criteria', assignmentData.criteria || '');
      
      if (assignmentData.file) {
        formData.append('file', assignmentData.file);
      }
      
      // Gestion des pièces jointes multiples
      if (assignmentData.attachments && assignmentData.attachments.length > 0) {
        Array.from(assignmentData.attachments).forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await axiosInstance.post('/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await fetchAssignments();
      toast.success('Devoir créé avec succès');
      return response.data;
    } catch (error) {
      console.error('Erreur création devoir (détail):', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error.message || 'Erreur lors de la création du devoir';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Créer un nouveau devoir (avec gestion upload et progression)
  const createAssignmentWithProgress = async (assignmentData, onProgress) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }
      const formData = new FormData();
      formData.append('title', assignmentData.title);
      formData.append('description', assignmentData.description || '');
      formData.append('type', assignmentData.type || 'tp');
      formData.append('course_id', assignmentData.course_id || courseId);
      formData.append('max_points', assignmentData.max_points || 20);
      
      // Formatage de la date
      if (assignmentData.due_date) {
        const dueDate = new Date(assignmentData.due_date).toISOString().slice(0, 19).replace('T', ' ');
        formData.append('due_date', dueDate);
      }
      
      formData.append('is_active', assignmentData.is_active ? 1 : 0);
      formData.append('criteria', assignmentData.criteria || '');
      
      if (assignmentData.file) {
        formData.append('file', assignmentData.file);
      }
      
      if (assignmentData.attachments && assignmentData.attachments.length > 0) {
        Array.from(assignmentData.attachments).forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await axiosInstance.post('/assignments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (event) => {
          if (event.lengthComputable && typeof onProgress === 'function') {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        }
      });
      
      await fetchAssignments();
      toast.success('Devoir créé avec succès');
      return response.data;
    } catch (error) {
      console.error('Erreur création devoir (détail):', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error.message || 'Erreur lors de la création du devoir';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Mettre à jour un devoir
  const updateAssignment = async (id, assignmentData) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }
      const response = await axiosInstance.put(`/assignments/${id}`, assignmentData);
      await fetchAssignments();
      toast.success('Devoir mis à jour avec succès');
      return response.data;
    } catch (error) {
      console.error('Erreur mise à jour devoir:', error);
      toast.error(error?.response?.data?.message || error.message || 'Erreur lors de la mise à jour du devoir');
      throw error;
    }
  };

  // Noter un devoir
  const gradeAssignment = async (id, gradeData) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }
      const response = await axiosInstance.put(`/assignments/${id}/grade`, gradeData);
      await fetchAssignments();
      toast.success('Devoir noté avec succès');
      return response.data;
    } catch (error) {
      console.error('Erreur notation devoir:', error);
      toast.error(error?.response?.data?.message || error.message || 'Erreur lors de la notation du devoir');
      throw error;
    }
  };

  // Supprimer un devoir
  const deleteAssignment = async (id) => {
    try {
      if (!isLoggedIn) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }
      await axiosInstance.delete(`/assignments/${id}`);
      await fetchAssignments();
      toast.success('Devoir supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression devoir:', error);
      toast.error(error?.response?.data?.message || error.message || 'Erreur lors de la suppression du devoir');
      throw error;
    }
  };

  // Charger les devoirs au montage du composant
  useEffect(() => {
    if (isLoggedIn) {
      fetchAssignments();
    }
  }, [courseId, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    createAssignment,
    createAssignmentWithProgress,
    updateAssignment,
    gradeAssignment,
    deleteAssignment
  };
};

export default useAssignments;