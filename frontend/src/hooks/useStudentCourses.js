// src/hooks/useStudentCourses.js
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/api/axios';

export const useStudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les formations auxquelles l'étudiant est inscrit
  const fetchMyFormations = useCallback(async () => {
    try {
      console.log('Fetching formations...');
      
      const response = await axiosInstance.get('/user/enrollments');
      console.log('Response status:', response.status);

      const enrollments = response.data;
      console.log('Enrollments received:', enrollments);
      

      // Transformer les inscriptions en formations avec métadonnées (ne plus filtrer sur payment_status)
      const formationsData = enrollments
        .filter(enrollment => enrollment && enrollment.formation)
        .map(enrollment => {
          const formation = enrollment.formation;
          return {
            id: formation.id,
            title: formation.title || 'Sans titre',
            description: formation.description || '',
            image: formation.image || '/api/placeholder/400/200',
            category: formation.category?.name || 'Non catégorisé',
            teacher_name: formation.teacher?.name || formation.teacher?.nom || 'Formateur inconnu',
            progress: parseFloat(enrollment.progress_percentage) || 0,
            enrolled_at: enrollment.enrolled_at,
            completed_at: enrollment.completed_at,
            total_courses: formation.courses?.length || 0,
            completed_courses: Math.floor((parseFloat(enrollment.progress_percentage) || 0) * (formation.courses?.length || 1) / 100),
            lastActivity: enrollment.updated_at || enrollment.enrolled_at,
            enrollmentId: enrollment.id
          };
        })
        .filter(Boolean); // Filtrer les valeurs null

      console.log('Formatted formations:', formationsData);
      setFormations(formationsData);
      return formationsData;
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
      setError(error.message);
      setFormations([]);
      return [];
    }
  }, []);

  // Récupérer les cours d'une formation spécifique
  const fetchFormationCourses = useCallback(async (formationId) => {
    try {
      console.log('Fetching courses for formation:', formationId);

      const response = await axiosInstance.get(`/student/formations/${formationId}/courses`);
      const coursesData = response.data;
      console.log('Courses received:', coursesData);
      
      return coursesData;
    } catch (error) {
      console.error('Erreur lors du chargement des cours de la formation:', error);
      throw error;
    }
  }, []);

  // Récupérer tous les cours suivis (via les formations)
  const fetchFollowedCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // D'abord récupérer les formations
      const formationsData = await fetchMyFormations();
      
      // Ensuite récupérer tous les cours de ces formations
      const allCourses = [];
      
      for (const formation of formationsData) {
        try {
          const formationCourses = await fetchFormationCourses(formation.id);
          // Ajouter les métadonnées de la formation à chaque cours
          const coursesWithFormationData = formationCourses.map(course => ({
            ...course,
            formation_title: formation.title,
            formation_id: formation.id,
            category: formation.category
          }));
          allCourses.push(...coursesWithFormationData);
        } catch (error) {
          console.warn(`Erreur pour la formation ${formation.id}:`, error);
        }
      }

      console.log('All courses loaded:', allCourses);
      setCourses(allCourses);
      return allCourses;
    } catch (error) {
      console.error('Erreur lors du chargement des cours suivis:', error);
      setError(error.message);
      setCourses([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchMyFormations, fetchFormationCourses]);

  // Mettre à jour la progression d'un cours
  const updateCourseProgress = async (courseId, progressData) => {
    try {
      // Mettre à jour localement d'abord
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, ...progressData }
            : course
        )
      );

      // Appeler l'API pour persister
      await axiosInstance.post(`/student/courses/${courseId}/mark-progress`, {
        progress_percentage: progressData.progress,
        last_chapter: progressData.lastChapter
      });

      console.log('Progression mise à jour pour le cours:', courseId);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      // Recharger les données en cas d'erreur
      await fetchFollowedCourses();
    }
  };

  // Mettre à jour la progression d'une formation
  const updateFormationProgress = async (formationId, progressData) => {
    try {
      // Mettre à jour localement d'abord
      setFormations(prevFormations => 
        prevFormations.map(formation => 
          formation.id === formationId 
            ? { ...formation, ...progressData }
            : formation
        )
      );

      // Trouver l'enrollmentId
      const formation = formations.find(f => f.id === formationId);
      if (!formation) {
        throw new Error('Formation non trouvée');
      }

      await axiosInstance.put(`/formation-enrollments/${formation.enrollmentId}/progress`, {
        progress_percentage: progressData.progress
      });

      console.log('Progression formation mise à jour:', formationId);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression formation:', error);
      await fetchMyFormations();
    }
  };

  // Recharger les formations après inscription
  const reloadFormations = async () => {
    setLoading(true);
    await fetchFollowedCourses();
  };

  // Charger les données au montage
  useEffect(() => {
    fetchFollowedCourses();
  }, []); // Retirer fetchFollowedCourses des dépendances pour éviter les boucles

  return {
    // Données
    courses,
    formations,
    loading,
    error,
    
    // Actions
    fetchFollowedCourses,
    fetchMyFormations,
    fetchFormationCourses,
    updateCourseProgress,
    updateFormationProgress,
    reloadFormations,
  };
};