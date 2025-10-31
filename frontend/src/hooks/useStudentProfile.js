// src/hooks/useStudentProfile.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useStudentProfile = () => {
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

  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  // Récupérer le profil étudiant
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir votre profil.');
      }

      const response = await fetch('/api/my-student-profile', {
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
          // Données utilisateur
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
      
      // Adapter les données pour le frontend
      const adaptedProfile = {
        id: data.id,
        user_id: data.user_id,
        specialite: data.specialite || '',
        photo: data.photo || 'avatar1.svg',
        last_login_at: data.last_login_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Données utilisateur
        nom: data.user?.nom || '',
        email: data.user?.email || '',
        tel: data.user?.tel || '',
        ville: data.user?.ville || '',
        villeOrigine: data.user?.villeOrigine || '',
        naissance: data.user?.naissance || ''
      };

      setProfile(adaptedProfile);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError(error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le profil étudiant
  const updateProfile = async (profileData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Préparer les données pour l'API
      const dataToSend = {};
      
      // Ajouter tous les champs du profil s'ils sont fournis
      if (profileData.nom) dataToSend.nom = profileData.nom;
      if (profileData.email) dataToSend.email = profileData.email;
      if (profileData.tel) dataToSend.tel = profileData.tel;
      if (profileData.naissance) dataToSend.naissance = profileData.naissance;
      if (profileData.ville) dataToSend.ville = profileData.ville;
      if (profileData.villeOrigine) dataToSend.villeOrigine = profileData.villeOrigine;
      if (profileData.specialite) dataToSend.specialite = profileData.specialite;
      if (profileData.photo) dataToSend.photo = profileData.photo;

      console.log('Données envoyées à l\'API:', dataToSend);

      const response = await fetch('/api/my-student-profile', {
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
        const errorData = await response.json();
        console.error('Erreur de l\'API:', errorData);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      const result = await response.json();
      console.log('Réponse de l\'API:', result);
      
      // Adapter les données de retour
      const updatedProfile = {
        id: result.student_profile.id,
        user_id: result.student_profile.user_id,
        specialite: result.student_profile.specialite || '',
        photo: result.student_profile.photo || 'avatar1.svg',
        last_login_at: result.student_profile.last_login_at,
        created_at: result.student_profile.created_at,
        updated_at: result.student_profile.updated_at,
        // Données utilisateur
        nom: result.user.nom,
        email: result.user.email,
        tel: result.user.tel || '',
        ville: result.user.ville || '',
        villeOrigine: result.user.villeOrigine || '',
        naissance: result.user.naissance || ''
      };

      setProfile(updatedProfile);
      
      // Mettre à jour le contexte d'authentification avec les nouvelles données utilisateur
      updateUserData({
        nom: result.user.nom,
        email: result.user.email,
        tel: result.user.tel,
        ville: result.user.ville,
        villeOrigine: result.user.villeOrigine,
        naissance: result.user.naissance
      });

      toast.success('Profil étudiant mis à jour avec succès');
      
      // Forcer le rechargement du profil après modification
      await fetchProfile();
      
      return updatedProfile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil étudiant:', error);
      toast.error('Erreur lors de la mise à jour du profil étudiant');
      throw error;
    }
  };

  // Charger le profil au montage du composant
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

export default useStudentProfile;
