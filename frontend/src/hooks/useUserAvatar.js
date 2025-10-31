// src/hooks/useUserAvatar.js
import { useState, useEffect } from 'react';

export const useUserAvatar = () => {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'avatar de l'utilisateur depuis le localStorage ou l'API
    const loadUserAvatar = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.avatar) {
          setAvatar(user.avatar);
        } else {
          // Avatar par défaut si aucun avatar n'est défini
          setAvatar('/default-avatar.png');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'avatar:', error);
        setAvatar('/default-avatar.png');
      } finally {
        setLoading(false);
      }
    };

    loadUserAvatar();
  }, []);

  // Fonction pour mettre à jour l'avatar
  const updateAvatar = (newAvatarUrl) => {
    setAvatar(newAvatarUrl);
    
    // Mettre à jour aussi dans le localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.avatar = newAvatarUrl;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    }
  };

  // Fonction pour synchroniser l'avatar avec le serveur
  const syncAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.avatar && userData.avatar !== avatar) {
          updateAvatar(userData.avatar);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de l\'avatar:', error);
    }
  };

  return {
    avatar,
    loading,
    updateAvatar,
    syncAvatar
  };
};

export default useUserAvatar;
