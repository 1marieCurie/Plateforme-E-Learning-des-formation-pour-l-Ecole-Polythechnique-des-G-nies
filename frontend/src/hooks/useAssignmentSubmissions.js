// src/hooks/useAssignmentSubmissions.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useAssignmentSubmissions = (assignmentId = null) => {
  const [submissions, setSubmissions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
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

  // Récupérer les soumissions d'un devoir (pour formateurs/admin)
  const fetchSubmissions = async (specificAssignmentId = null) => {
    const targetId = specificAssignmentId || assignmentId;
    
    if (!targetId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les soumissions.');
      }

      const response = await fetch(`/api/assignments/${targetId}/submissions`, {
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
        setSubmissions(data.data || []);
      } else {
        throw new Error(data.message || 'Erreur lors du chargement des soumissions');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error);
      setError(error.message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer mes soumissions (pour étudiants)
  const fetchMySubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir vos soumissions.');
      }

      const response = await fetch('/api/my-submissions', {
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
        setMySubmissions(data.data || []);
      } else {
        throw new Error(data.message || 'Erreur lors du chargement de vos soumissions');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de mes soumissions:', error);
      setError(error.message);
      setMySubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Soumettre un devoir - Utilise la vraie route Laravel
  const submitAssignment = async (assignmentIdParam, submissionData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const formData = new FormData();
      // Ajouter le texte de soumission uniquement s'il est non vide et défini
      if (typeof submissionData.content === 'string' && submissionData.content.trim().length > 0) {
        formData.append('submission_text', submissionData.content.trim());
      }
      // Ajouter un seul fichier uniquement si le fichier existe et est un objet File
      if (Array.isArray(submissionData.files) && submissionData.files.length > 0 && submissionData.files[0] instanceof File) {
        formData.append('file', submissionData.files[0]);
      }

      const response = await fetch(`/api/assignments/${assignmentIdParam}/submit`, {
        method: 'POST',
        headers: getAuthHeaders(), // Pas de Content-Type pour FormData
        body: formData
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la soumission');
      }
      
      // Recharger mes soumissions
      await fetchMySubmissions();
      
      toast.success(result.message || 'Devoir soumis avec succès');
      return result.data;
    } catch (error) {
      console.error('Erreur soumission devoir:', error);
      toast.error(error.message || 'Erreur lors de la soumission du devoir');
      throw error;
    }
  };

  // Noter une soumission (pour formateurs/admin)
  const gradeSubmission = async (submissionId, gradeData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points_earned: gradeData.points_earned,
          feedback: gradeData.feedback
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la notation');
      }
      
      // Recharger les soumissions
      if (assignmentId) {
        await fetchSubmissions();
      }
      
      toast.success(result.message || 'Soumission notée avec succès');
      return result.data;
    } catch (error) {
      console.error('Erreur notation soumission:', error);
      toast.error(error.message || 'Erreur lors de la notation de la soumission');
      throw error;
    }
  };

  // Supprimer une soumission
  const deleteSubmission = async (submissionId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/submissions/${submissionId}`, {
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
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la suppression');
      }

      // Recharger les données
      await fetchMySubmissions();
      if (assignmentId) {
        await fetchSubmissions();
      }
      
      toast.success(result.message || 'Soumission supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression soumission:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la soumission');
      throw error;
    }
  };

  // Vérifier si j'ai déjà soumis ce devoir
  const hasSubmitted = (assignmentIdToCheck) => {
    return mySubmissions.some(submission => 
      submission.assignment && submission.assignment.id === assignmentIdToCheck
    );
  };

  // Obtenir ma soumission pour un devoir
  const getMySubmission = (assignmentIdToCheck) => {
    return mySubmissions.find(submission => 
      submission.assignment && submission.assignment.id === assignmentIdToCheck
    );
  };

  // Obtenir les statistiques de mes soumissions
  const getSubmissionStats = () => {
    const total = mySubmissions.length;
    const graded = mySubmissions.filter(s => s.grade).length;
    const late = mySubmissions.filter(s => s.is_late).length;
    const pending = total - graded;
    
    let averageGrade = 0;
    if (graded > 0) {
      const totalGrades = mySubmissions
        .filter(s => s.grade)
        .reduce((sum, s) => sum + s.grade.grade, 0);
      averageGrade = totalGrades / graded;
    }

    return {
      total,
      graded,
      late,
      pending,
      averageGrade: Math.round(averageGrade * 100) / 100
    };
  };

  // Charger les données au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        if (assignmentId) {
          await fetchSubmissions();
        }
        await fetchMySubmissions();
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
      }
    };

    loadData();
  }, [assignmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    submissions,
    mySubmissions,
    loading,
    error,
    fetchSubmissions,
    fetchMySubmissions,
    submitAssignment,
    gradeSubmission,
    deleteSubmission,
    hasSubmitted,
    getMySubmission,
    getSubmissionStats
  };
};

export default useAssignmentSubmissions;