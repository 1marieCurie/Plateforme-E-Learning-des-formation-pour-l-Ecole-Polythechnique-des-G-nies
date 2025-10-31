// src/hooks/useChapterResources.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useChapterResources = (chapterId = null) => {
  const [resources, setResources] = useState([]);
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

  // Récupérer les ressources d'un chapitre
  const fetchResources = async (specificChapterId = null) => {
    const targetId = specificChapterId || chapterId;
    
    if (!targetId) {
      setResources([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les ressources.');
      }

      const response = await fetch(`/api/chapters/${targetId}/resources`, {
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
      setResources(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
      setError(error.message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle ressource
  const createResource = async (resourceData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const formData = new FormData();
      
      // Ajouter les données textuelles
      formData.append('title', resourceData.title);
      if (resourceData.description) {
        formData.append('description', resourceData.description);
      }
      formData.append('file_type', resourceData.file_type);
      if (resourceData.is_downloadable !== undefined) {
        formData.append('is_downloadable', resourceData.is_downloadable);
      }
      if (resourceData.is_required !== undefined) {
        formData.append('is_required', resourceData.is_required);
      }
      if (resourceData.access_level) {
        formData.append('access_level', resourceData.access_level);
      }
      if (resourceData.order_index !== undefined) {
        formData.append('order_index', resourceData.order_index);
      }
      if (resourceData.is_active !== undefined) {
        formData.append('is_active', resourceData.is_active);
      }
      if (resourceData.available_from) {
        formData.append('available_from', resourceData.available_from);
      }
      if (resourceData.available_until) {
        formData.append('available_until', resourceData.available_until);
      }
      if (resourceData.duration_seconds !== undefined) {
        formData.append('duration_seconds', resourceData.duration_seconds);
      }
      if (resourceData.metadata) {
        formData.append('metadata', JSON.stringify(resourceData.metadata));
      }
      // Ajouter le fichier si présent
      if (resourceData.file) {
        formData.append('file', resourceData.file);
      }
      // Ajouter l'URL si c'est un lien
      if (resourceData.file_type === 'link' && resourceData.link_url) {
        formData.append('link_url', resourceData.link_url);
      }

      const response = await fetch(`/api/chapters/${chapterId}/resources`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
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
      
      // Recharger les ressources
      await fetchResources();
      
      toast.success('Ressource créée avec succès');
      return result;
    } catch (error) {
      console.error('Erreur création ressource:', error);
      toast.error('Erreur lors de la création de la ressource');
      throw error;
    }
  };

  // Mettre à jour une ressource
  const updateResource = async (resourceId, resourceData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const formData = new FormData();
      
      // Ajouter les données textuelles modifiées
      if (resourceData.title) {
        formData.append('title', resourceData.title);
      }
      if (resourceData.description !== undefined) {
        formData.append('description', resourceData.description);
      }
      if (resourceData.file_type) {
        formData.append('file_type', resourceData.file_type);
      }
      if (resourceData.is_downloadable !== undefined) {
        formData.append('is_downloadable', resourceData.is_downloadable);
      }
      if (resourceData.is_required !== undefined) {
        formData.append('is_required', resourceData.is_required);
      }
      if (resourceData.access_level) {
        formData.append('access_level', resourceData.access_level);
      }
      
      // Nouveau fichier si fourni
      if (resourceData.file) {
        formData.append('file', resourceData.file);
      }

      const response = await fetch(`/api/chapters/${chapterId}/resources/${resourceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formData
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
      
      // Recharger les ressources
      await fetchResources();
      
      toast.success('Ressource mise à jour avec succès');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour ressource:', error);
      toast.error('Erreur lors de la mise à jour de la ressource');
      throw error;
    }
  };

  // Supprimer une ressource
  const deleteResource = async (resourceId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/chapters/${chapterId}/resources/${resourceId}`, {
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

      // Recharger les ressources
      await fetchResources();
      
      toast.success('Ressource supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression ressource:', error);
      toast.error('Erreur lors de la suppression de la ressource');
      throw error;
    }
  };

  // Télécharger une ressource
  const downloadResource = async (resourceId) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/chapters/${chapterId}/resources/${resourceId}/download`, {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Récupérer le blob et déclencher le téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtenir le nom du fichier depuis les headers ou utiliser un nom par défaut
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `resource_${resourceId}`;
        
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Téléchargement démarré');
      return true;
    } catch (error) {
      console.error('Erreur téléchargement ressource:', error);
      toast.error('Erreur lors du téléchargement');
      throw error;
    }
  };

  // Réorganiser les ressources
  const reorderResources = async (resourceIds) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/chapters/${chapterId}/resources/reorder`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resource_ids: resourceIds })
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

      // Recharger les ressources
      await fetchResources();
      
      toast.success('Ordre des ressources mis à jour');
      return true;
    } catch (error) {
      console.error('Erreur réorganisation ressources:', error);
      toast.error('Erreur lors de la réorganisation');
      throw error;
    }
  };

  // Obtenir les statistiques des ressources
  const getResourceStats = async () => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/chapters/${chapterId}/resources/stats`, {
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
      console.error('Erreur statistiques ressources:', error);
      throw error;
    }
  };

  // Charger les ressources au montage du composant
  useEffect(() => {
    if (chapterId) {
      fetchResources();
    }
  }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    resources,
    loading,
    error,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    downloadResource,
    reorderResources,
    getResourceStats
  };
};

export default useChapterResources;
