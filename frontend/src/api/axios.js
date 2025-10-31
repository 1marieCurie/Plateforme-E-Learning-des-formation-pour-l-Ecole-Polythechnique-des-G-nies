// src/api/axios.js
import axios from 'axios';
import { getToken, logoutUser, isTokenValid } from '../services/auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 Requête ${config.method?.toUpperCase()} vers ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse ${response.status} de ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Erreur ${error.response?.status} de ${error.config?.url}:`, error.response?.data);
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Ne pas déclencher la déconnexion automatique si on est déjà sur la page de login
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.warn('🔐 Session expirée - déconnexion automatique');
        logoutUser();
        // Rediriger vers la page de login
        window.location.href = '/login';
      } else {
        console.log('🔐 Erreur d\'authentification sur la page de login - pas de redirection');
      }
    }
    // Gestion des erreurs réseau
    if (!error.response) {
      console.error('❌ Erreur réseau - impossible de contacter le serveur');
    }
    return Promise.reject(error);
  }
);

export default api;
