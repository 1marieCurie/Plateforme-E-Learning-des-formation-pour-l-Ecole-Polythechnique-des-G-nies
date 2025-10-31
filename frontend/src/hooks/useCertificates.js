// src/hooks/useCertificates.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [courseCertificates, setCourseCertificates] = useState([]);
  const [formationCertificates, setFormationCertificates] = useState([]);
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

  // Récupérer tous les certificats de l'utilisateur connecté
  const fetchMyCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir vos certificats.');
      }

      // ⚠️ ROUTES API MANQUANTES - Utiliser des routes temporaires
      const courseCertResponse = await fetch('/api/my-course-certificates', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      // ⚠️ ROUTES API MANQUANTES - Utiliser des routes temporaires
      const formationCertResponse = await fetch('/api/my-formation-certificates', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (courseCertResponse.status === 401 || formationCertResponse.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!courseCertResponse.ok || !formationCertResponse.ok) {
        throw new Error('Erreur lors du chargement des certificats');
      }

      const courseData = await courseCertResponse.json();
      const formationData = await formationCertResponse.json();

      setCourseCertificates(Array.isArray(courseData) ? courseData : []);
      setFormationCertificates(Array.isArray(formationData) ? formationData : []);
      
      // Combiner tous les certificats
      const allCertificates = [
        ...(Array.isArray(courseData) ? courseData.map(cert => ({...cert, type: 'course'})) : []),
        ...(Array.isArray(formationData) ? formationData.map(cert => ({...cert, type: 'formation'})) : [])
      ];
      setCertificates(allCertificates);

    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error);
      setError(error.message);
      setCertificates([]);
      setCourseCertificates([]);
      setFormationCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les certificats d'un utilisateur spécifique (admin/formateur)
  const fetchUserCertificates = async (userId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les certificats.');
      }

      const [courseCertResponse, formationCertResponse] = await Promise.all([
        fetch(`/api/users/${userId}/course-certificates`, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/users/${userId}/formation-certificates`, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (courseCertResponse.status === 401 || formationCertResponse.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!courseCertResponse.ok || !formationCertResponse.ok) {
        throw new Error('Erreur lors du chargement des certificats de l\'utilisateur');
      }

      const courseData = await courseCertResponse.json();
      const formationData = await formationCertResponse.json();

      return {
        courseCertificates: Array.isArray(courseData) ? courseData : [],
        formationCertificates: Array.isArray(formationData) ? formationData : []
      };

    } catch (error) {
      console.error('Erreur lors du chargement des certificats utilisateur:', error);
      setError(error.message);
      throw error;
    }
  };

  // Générer un certificat de cours
  const generateCourseCertificate = async (courseId, certificateData = {}) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const adaptedData = {
        course_id: courseId,
        title: certificateData.title,
        description: certificateData.description,
        final_grade: certificateData.final_grade,
        total_hours_completed: certificateData.total_hours_completed || 0,
        completed_chapters: certificateData.completed_chapters,
        assignment_scores: certificateData.assignment_scores,
        course_started_at: certificateData.course_started_at,
        course_completed_at: certificateData.course_completed_at || new Date().toISOString(),
        certificate_template: certificateData.certificate_template || 'default',
        metadata: certificateData.metadata
      };

      const response = await fetch('/api/course-certificates', {
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
      
      // Recharger les certificats
      await fetchMyCertificates();
      
      toast.success('Certificat de cours généré avec succès');
      return result;
    } catch (error) {
      console.error('Erreur génération certificat cours:', error);
      toast.error('Erreur lors de la génération du certificat de cours');
      throw error;
    }
  };

  // Générer un certificat de formation
  const generateFormationCertificate = async (formationId, certificateData = {}) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const adaptedData = {
        formation_id: formationId,
        title: certificateData.title,
        description: certificateData.description,
        overall_grade: certificateData.overall_grade,
        total_hours_completed: certificateData.total_hours_completed || 0,
        total_courses_completed: certificateData.total_courses_completed || 0,
        course_certificates: certificateData.course_certificates,
        skills_acquired: certificateData.skills_acquired,
        competency_scores: certificateData.competency_scores,
        formation_started_at: certificateData.formation_started_at,
        formation_completed_at: certificateData.formation_completed_at || new Date().toISOString(),
        certificate_template: certificateData.certificate_template || 'formation_default',
        certificate_level: certificateData.certificate_level || 'completion', // completion, excellence, distinction
        metadata: certificateData.metadata
      };

      const response = await fetch('/api/formation-certificates', {
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
      
      // Recharger les certificats
      await fetchMyCertificates();
      
      toast.success('Certificat de formation généré avec succès');
      return result;
    } catch (error) {
      console.error('Erreur génération certificat formation:', error);
      toast.error('Erreur lors de la génération du certificat de formation');
      throw error;
    }
  };

  // Télécharger un certificat (PDF)
  const downloadCertificate = async (certificateId, type = 'course') => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour télécharger un certificat.');
      }

      const endpoint = type === 'course' 
        ? `/api/course-certificates/${certificateId}/download`
        : `/api/formation-certificates/${certificateId}/download`;

      const response = await fetch(endpoint, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du certificat');
      }

      // Créer un lien de téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificat-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('Certificat téléchargé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur téléchargement certificat:', error);
      toast.error('Erreur lors du téléchargement du certificat');
      throw error;
    }
  };

  // Vérifier un certificat par son code de vérification
  const verifyCertificate = async (verificationCode) => {
    try {
      const response = await fetch(`/api/certificates/verify/${verificationCode}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Certificat non trouvé ou code de vérification invalide');
        }
        throw new Error('Erreur lors de la vérification du certificat');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur vérification certificat:', error);
      throw error;
    }
  };

  // Invalider un certificat (admin seulement)
  const invalidateCertificate = async (certificateId, type = 'course', reason = '') => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const endpoint = type === 'course' 
        ? `/api/course-certificates/${certificateId}/invalidate`
        : `/api/formation-certificates/${certificateId}/invalidate`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
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

      // Recharger les certificats
      await fetchMyCertificates();
      
      toast.success('Certificat invalidé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur invalidation certificat:', error);
      toast.error('Erreur lors de l\'invalidation du certificat');
      throw error;
    }
  };

  // Obtenir les statistiques des certificats
  const getCertificateStats = async (filters = {}) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les statistiques.');
      }

      const queryParams = new URLSearchParams();
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.type) queryParams.append('type', filters.type);

      const url = `/api/certificates/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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

  // Régénérer un certificat (en cas de mise à jour du template)
  const regenerateCertificate = async (certificateId, type = 'course', templateName = null) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const endpoint = type === 'course' 
        ? `/api/course-certificates/${certificateId}/regenerate`
        : `/api/formation-certificates/${certificateId}/regenerate`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template: templateName })
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

      // Recharger les certificats
      await fetchMyCertificates();
      
      toast.success('Certificat régénéré avec succès');
      return true;
    } catch (error) {
      console.error('Erreur régénération certificat:', error);
      toast.error('Erreur lors de la régénération du certificat');
      throw error;
    }
  };

  // Récupérer un certificat spécifique
  const getCertificate = async (certificateId, type = 'course') => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir ce certificat.');
      }

      const endpoint = type === 'course' 
        ? `/api/course-certificates/${certificateId}`
        : `/api/formation-certificates/${certificateId}`;

      const response = await fetch(endpoint, {
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
      console.error('Erreur lors du chargement du certificat:', error);
      setError(error.message);
      throw error;
    }
  };

  // Charger les certificats au montage du composant
  useEffect(() => {
    fetchMyCertificates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    certificates,
    courseCertificates,
    formationCertificates,
    loading,
    error,
    fetchMyCertificates,
    fetchUserCertificates,
    generateCourseCertificate,
    generateFormationCertificate,
    downloadCertificate,
    verifyCertificate,
    invalidateCertificate,
    getCertificateStats,
    regenerateCertificate,
    getCertificate
  };
};

export default useCertificates;
