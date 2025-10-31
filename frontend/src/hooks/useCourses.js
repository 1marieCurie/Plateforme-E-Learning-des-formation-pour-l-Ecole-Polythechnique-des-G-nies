// src/hooks/useCourses.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
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

  // Récupérer les cours du formateur connecté
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir vos cours.');
      }

      const response = await fetch('/api/my-courses', {
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
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
      setError(error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances car getAuthHeaders et isLoggedIn ne changent pas

  // Créer un nouveau cours
  const createCourse = async (courseData) => {
    try {
      console.log('useCourses: Début création cours', courseData);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Utiliser JSON au lieu de FormData puisqu'on n'envoie plus d'image
      const payload = {
        title: courseData.title,
        description: courseData.description,
        formation_id: courseData.formation_id,
        category_id: courseData.category_id
      };

      console.log('useCourses: Payload envoyé', payload);

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('useCourses: Réponse reçue', response.status);

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Erreur serveur' };
        }
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.errors || errorData.error)}`);
      }

      const result = await response.json();
      console.log('useCourses: Cours créé', result);
      
  // Le toast de succès est géré dans CourseCreationSection.jsx
      
      // Recharger les cours (ne pas bloquer si ça échoue)
      try {
        console.log('useCourses: Rechargement des cours...');
        await fetchCourses();
        console.log('useCourses: Rechargement terminé');
      } catch (fetchError) {
        console.warn('useCourses: Erreur lors du rechargement des cours:', fetchError);
        // On ne bloque pas la création pour autant
      }
      
      return result;
    } catch (error) {
      console.error('useCourses: Erreur création cours:', error);
      toast.error('Erreur lors de la création du cours');
      throw error;
    }
  };

  // Mettre à jour un cours
  const updateCourse = async (id, courseData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
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
      
      // Recharger les cours
      await fetchCourses();
      
      toast.success('Cours mis à jour avec succès');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour cours:', error);
      toast.error('Erreur lors de la mise à jour du cours');
      throw error;
    }
  };

  // Supprimer un cours
  const deleteCourse = async (id, force = false) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: force ? JSON.stringify({ force: true }) : undefined
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

      // Filtrage immédiat pour UX réactive
      setCourses(prev => prev.filter(c => c.id !== id));

      // Recharger les cours
      await fetchCourses();

      toast.success('Cours supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression cours:', error);
      toast.error('Erreur lors de la suppression du cours');
      throw error;
    }
  };

  // Charger les cours au montage du composant
  useEffect(() => {
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse
  };
};

export default useCourses;
