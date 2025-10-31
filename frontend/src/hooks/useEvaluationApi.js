// src/hooks/useEvaluationApi.js
import { useCallback } from 'react';

const API_BASE = '/api/evaluations';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export default function useEvaluationApi() {
  // Récupérer la note d'un étudiant pour un cours
  const fetchEvaluation = useCallback(async (courseId, studentId) => {
    const res = await fetch(`${API_BASE}/${courseId}/${studentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors de la récupération de la note');
    return await res.json();
  }, []);

  // Créer ou mettre à jour la note d'un étudiant pour un cours
  const saveEvaluation = useCallback(async (courseId, studentId, grade, comment) => {
    const res = await fetch(`${API_BASE}/${courseId}/${studentId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ grade, comment }),
    });
    if (!res.ok) throw new Error('Erreur lors de l\'enregistrement de la note');
    return await res.json();
  }, []);

  return { fetchEvaluation, saveEvaluation };
}
