// src/hooks/useAdminProfile.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateUserData } = useContext(AuthContext);

  // Fonctions utilitaires pour l'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Récupérer le profil admin (similaire à useStudentProfile)
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/my-admin-profile', {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (response.status === 404) {
        // Le profil n'existe pas encore, créer un profil vide
        setProfile({
          user_id: JSON.parse(localStorage.getItem('user'))?.id,
          specialite: '',
          photo: 'avatar1.svg',
          last_login_at: null,
          nom: '',
          email: '',
          tel: '',
          ville: '',
          villeOrigine: '',
          naissance: ''
        });
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Gestion explicite du rôle
      const role = data.user.role || data.user.type || '';
      let specialite = '';
      let photo = 'avatar1.svg';
      let last_login_at = null;

      if (role === 'super_admin') {
        // Pour super_admin, on peut forcer une spécialité et une photo par défaut si non présentes
        specialite = data.profile?.specialite || data.admin_profile?.specialite || 'Super Administrateur';
        photo = data.profile?.photo || data.admin_profile?.photo || 'superadmin.svg';
        last_login_at = data.profile?.last_login_at || data.admin_profile?.last_login_at || null;
      } else {
        // Pour admin classique
        specialite = data.profile?.specialite || data.admin_profile?.specialite || '';
        photo = data.profile?.photo || data.admin_profile?.photo || 'avatar1.svg';
        last_login_at = data.profile?.last_login_at || data.admin_profile?.last_login_at || null;
      }

      const adaptedProfile = {
        id: data.user.id,
        user_id: data.user.id,
        nom: data.user.nom || data.user.name || '',
        email: data.user.email || '',
        tel: data.user.tel || '',
        naissance: data.user.naissance || '',
        ville: data.user.ville || '',
        villeOrigine: data.user.villeOrigine || '',
        role,
        specialite,
        photo,
        created_at: data.user.created_at,
        last_login_at
      };

      setProfile(adaptedProfile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil admin:', error);
      setError(error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil admin (similaire à useStudentProfile)
  const updateProfile = async (profileData) => {
    try {
      // Préparer les données pour l'API
      const dataToSend = {};
      if (profileData.nom) dataToSend.nom = profileData.nom;
      if (profileData.email) dataToSend.email = profileData.email;
      if (profileData.tel) dataToSend.tel = profileData.tel;
      if (profileData.naissance) dataToSend.naissance = profileData.naissance;
      if (profileData.ville) dataToSend.ville = profileData.ville;
      if (profileData.villeOrigine) dataToSend.villeOrigine = profileData.villeOrigine;
      if (profileData.specialite) dataToSend.specialite = profileData.specialite;
      if (profileData.photo) dataToSend.photo = profileData.photo;

      console.log('Données envoyées à l\'API:', dataToSend);

      const response = await fetch('/api/my-admin-profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData = {};
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { message: await response.text() };
        }
        console.error('Erreur de l\'API:', errorData);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      const result = await response.json();
      console.log('Réponse de l\'API:', result);

      // Adapter les données de retour
      const updatedProfile = {
        id: result.user.id,
        user_id: result.user.id,
        nom: result.user.nom || result.user.name || '',
        email: result.user.email || '',
        tel: result.user.tel || '',
        naissance: result.user.naissance || '',
        ville: result.user.ville || '',
        villeOrigine: result.user.villeOrigine || '',
        specialite: (result.profile?.specialite || result.admin_profile?.specialite || ''),
        photo: (result.profile?.photo || result.admin_profile?.photo || 'avatar1.svg'),
        created_at: result.user.created_at,
        last_login_at: (result.profile?.last_login_at || result.admin_profile?.last_login_at)
      };

      setProfile(updatedProfile);

      // Mettre à jour le contexte d'authentification avec les nouvelles données utilisateur
      updateUserData({
        nom: updatedProfile.nom,
        email: updatedProfile.email,
        tel: updatedProfile.tel,
        ville: updatedProfile.ville,
        villeOrigine: updatedProfile.villeOrigine,
        naissance: updatedProfile.naissance
      });

      toast.success('Profil admin mis à jour avec succès');

      // Forcer le rechargement du profil après modification
      await fetchProfile();

      return updatedProfile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil admin:', error);
      toast.error('Erreur lors de la mise à jour du profil admin');
      throw error;
    }
  };

  // Charger le profil au montage
  useEffect(() => {
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};

export default useAdminProfile;
