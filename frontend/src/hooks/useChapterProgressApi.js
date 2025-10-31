// src/hooks/useChapterProgressApi.js
const API_BASE = '/api/chapters';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function markChapterAsRead(chapterId) {
  const res = await fetch(`${API_BASE}/${chapterId}/mark-read`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour de la progression du chapitre');
  return await res.json();
}
