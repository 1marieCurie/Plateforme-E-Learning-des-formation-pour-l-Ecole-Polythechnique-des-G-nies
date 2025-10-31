// src/hooks/useUsers.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
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

  // Récupérer tous les utilisateurs (admin seulement)
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir les utilisateurs.');
      }

      const response = await fetch('/api/users', {
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

      if (response.status === 403) {
        throw new Error('Accès refusé. Vous devez être administrateur.');
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError(error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel utilisateur
  const createUser = async (userData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = {
        nom: userData.name || userData.nom,
        email: userData.email,
        password: userData.password,
        tel: userData.phone || userData.tel,
        indicatif: userData.country_code || userData.indicatif || '+212',
        ville: userData.city || userData.ville,
        villeOrigine: userData.is_native_city || userData.villeOrigine || false,
        naissance: userData.birth_date || userData.naissance,
  role: userData.role // etudiant, formateur, admin, super_admin
      };

      const response = await fetch('/api/users', {
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
      
      // Recharger les utilisateurs
      await fetchUsers();
      
      toast.success('Utilisateur créé avec succès');
      return result;
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
      throw error;
    }
  };

  // Mettre à jour un utilisateur
  const updateUser = async (id, userData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Adapter les données pour correspondre aux champs BD
      const adaptedData = {
        nom: userData.name || userData.nom,
        email: userData.email,
        tel: userData.phone || userData.tel,
        indicatif: userData.country_code || userData.indicatif,
        ville: userData.city || userData.ville,
        villeOrigine: userData.is_native_city || userData.villeOrigine,
        naissance: userData.birth_date || userData.naissance,
  role: userData.role // etudiant, formateur, admin, super_admin
      };

      // Supprimer les champs undefined
      Object.keys(adaptedData).forEach(key => {
        if (adaptedData[key] === undefined) {
          delete adaptedData[key];
        }
      });

      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
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
      
      // Recharger les utilisateurs
      await fetchUsers();
      
      toast.success('Utilisateur mis à jour avec succès');
      return result;
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
      throw error;
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (id) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      const response = await fetch(`/api/users/${id}`, {
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

      // Recharger les utilisateurs
      await fetchUsers();
      
      toast.success('Utilisateur supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      throw error;
    }
  };

  // Changer le statut d'un utilisateur (actif/inactif)
  const toggleUserStatus = async (id, isActive) => {
    try {
      const response = await fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${JSON.stringify(errorData.error || errorData.message)}`);
      }

      // Recharger les utilisateurs
      await fetchUsers();
      
      toast.success(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`);
      return true;
    } catch (error) {
      console.error('Erreur changement statut utilisateur:', error);
      toast.error('Erreur lors du changement de statut');
      throw error;
    }
  };

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus
  };
};

export default useUsers;
