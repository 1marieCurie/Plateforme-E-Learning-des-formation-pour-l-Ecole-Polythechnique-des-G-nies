// src/services/auth.js

// Stocker le token et les infos utilisateur
export function saveAuth(token, user) {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    console.log("Authentification sauvegardée:", { token: token ? "✓" : "✗", user: user?.email });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'authentification:", error);
  }
}

// Supprimer le token et les infos utilisateur
export function logoutUser() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    console.log("Utilisateur déconnecté - localStorage nettoyé");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
}

// Récupérer le token
export function getToken() {
  try {
    const token = localStorage.getItem("token");
    return token;
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error);
    return null;
  }
}

// Récupérer l'utilisateur (parsé depuis localStorage)
export function getUser() {
  try {
    const user = localStorage.getItem("user");
    if (!user) return null;
    const parsedUser = JSON.parse(user);
    return parsedUser;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    // Nettoyer le localStorage si les données sont corrompues
    localStorage.removeItem("user");
    return null;
  }
}

// Vérifier si connecté
export function isLoggedIn() {
  const token = getToken();
  const user = getUser();
  // Vérifier que les deux existent et sont valides
  const isValid = !!(token && user && user.id && user.role);
  if (!isValid && (token || user)) {
    // Si l'un existe mais pas l'autre, nettoyer
    console.warn("Données d'authentification incomplètes - nettoyage");
    logoutUser();
  }
  return isValid;
}

// Vérifier si le token semble valide (basique)
export function isTokenValid(token) {
  if (!token) return false;
  try {
    // Vérification basique de la structure JWT (3 parties séparées par des points)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Tenter de décoder le payload (sans vérifier la signature)
    const payload = JSON.parse(atob(parts[1]));
    // Vérifier l'expiration si elle existe
    if (payload.exp) {
      const now = Date.now() / 1000;
      if (payload.exp < now) {
        console.warn("Token expiré");
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Token invalide:", error);
    return false;
  }
}

// Nettoyer l'authentification si les données sont corrompues
export function cleanupAuth() {
  const token = getToken();
  const user = getUser();
  if ((token && !isTokenValid(token)) || (token && !user) || (!token && user)) {
    console.warn("Nettoyage des données d'authentification corrompues");
    logoutUser();
    return false;
  }
  return true;
}
