// src/hooks/useTeacherProfile.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useTeacherProfile = () => {
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

  // Récupérer le profil du formateur connecté
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour voir votre profil.');
      }

      const response = await fetch('/api/my-profile-teacher', {
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
          bio: '',
          experience_years: 0,
          photo: 'avatar1.svg',
          linkedin_url: '',
          website_url: '',
          certifications: [],
          skills: [],
          is_verified: false,
          average_rating: 0.00,
          total_students: 0,
          total_formations: 0,
          total_courses: 0,
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
        bio: data.bio || '',
        experience_years: data.experience_years || 0,
        photo: data.photo || 'avatar1.svg',
        linkedin_url: data.linkedin_url || '',
        website_url: data.website_url || '',
        certifications: data.certifications || [],
        skills: data.skills || [],
        is_verified: data.is_verified || false,
        average_rating: data.average_rating || 0.00,
        total_students: data.total_students || 0,
        total_formations: data.total_formations || 0,
        total_courses: data.total_courses || 0,
        last_login_at: data.last_login_at,
        created_at: data.created_at,
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

  // Mettre à jour le profil du formateur
  const updateProfile = async (profileData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour effectuer cette action.');
      }

      // Préparer les données pour l'API en JSON (plus simple et fiable)
      const dataToSend = {};
      
      // Ajouter tous les champs du profil s'ils sont fournis
      if (profileData.nom) dataToSend.nom = profileData.nom;
      if (profileData.email) dataToSend.email = profileData.email;
      if (profileData.tel) dataToSend.tel = profileData.tel;
      if (profileData.naissance) dataToSend.naissance = profileData.naissance;
      if (profileData.ville) dataToSend.ville = profileData.ville;
      if (profileData.villeOrigine) dataToSend.villeOrigine = profileData.villeOrigine;
      if (profileData.specialite) dataToSend.specialite = profileData.specialite;
      if (profileData.bio) dataToSend.bio = profileData.bio;
      if (profileData.experience_years !== undefined) dataToSend.experience_years = profileData.experience_years;
      if (profileData.linkedin_url) dataToSend.linkedin_url = profileData.linkedin_url;
      if (profileData.website_url) dataToSend.website_url = profileData.website_url;
      if (profileData.certifications) dataToSend.certifications = profileData.certifications;
      if (profileData.skills) dataToSend.skills = profileData.skills;
      if (profileData.photo) dataToSend.photo = profileData.photo;

      console.log('Données envoyées à l\'API:', dataToSend);

      const response = await fetch(`/api/my-profile-teacher`, {
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
        id: result.teacher_profile.id,
        user_id: result.teacher_profile.user_id,
        specialite: result.teacher_profile.specialite || '',
        bio: result.teacher_profile.bio || '',
        experience_years: result.teacher_profile.experience_years || 0,
        photo: result.teacher_profile.photo || 'avatar1.svg',
        linkedin_url: result.teacher_profile.linkedin_url || '',
        website_url: result.teacher_profile.website_url || '',
        certifications: result.teacher_profile.certifications || [],
        skills: result.teacher_profile.skills || [],
        is_verified: result.teacher_profile.is_verified || false,
        average_rating: result.teacher_profile.average_rating || 0.00,
        total_students: result.teacher_profile.total_students || 0,
        total_formations: result.teacher_profile.total_formations || 0,
        total_courses: result.teacher_profile.total_courses || 0,
        last_login_at: result.teacher_profile.last_login_at,
        created_at: result.teacher_profile.created_at,
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

      toast.success('Profil formateur mis à jour avec succès');
      
      // Forcer le rechargement du profil après modification
      await fetchProfile();
      
      return updatedProfile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil formateur:', error);
      toast.error('Erreur lors de la mise à jour du profil formateur');
      throw error;
    }
  };
  
  // Créer un nouveau profil formateur
  const createProfile = async (profileData) => {
    try {
      if (!isLoggedIn()) {
        throw new Error('Vous devez être connecté pour créer un profil.');
      }

      const response = await fetch('/api/teacher-profiles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorData.message || 'Erreur inconnue'}`);
      }

      const result = await response.json();
      toast.success('Profil formateur créé avec succès');
      await fetchProfile(); // Recharger le profil
      return result;
    } catch (error) {
      console.error('Erreur création profil formateur:', error);
      toast.error('Erreur lors de la création du profil formateur');
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
    updateProfile,
    createProfile
  };
};

export default useTeacherProfile;
