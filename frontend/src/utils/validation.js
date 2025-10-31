// src/utils/validation.js

// 📧 Validation email renforcée
export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!email) {
    return "L'adresse email est obligatoire";
  }
  
  if (!emailRegex.test(email)) {
    return "Format d'email invalide (exemple: nom@domaine.com)";
  }
  
  return null; // Pas d'erreur
};

// 🔒 Validation mot de passe robuste
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return "Le mot de passe est requis";
  }
  
  if (password.length < 8) {
    errors.push("Au moins 8 caractères");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Une majuscule");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Une minuscule");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Un chiffre");
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Un caractère spécial");
  }
  
  if (errors.length > 0) {
    return `Le mot de passe doit contenir : ${errors.join(', ')}`;
  }
  
  return null; // Pas d'erreur
};

// 🔄 Validation confirmation mot de passe
export const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation) {
    return "La confirmation du mot de passe est requise";
  }
  
  if (password !== confirmation) {
    return "Les mots de passe ne correspondent pas";
  }
  
  return null; // Pas d'erreur
};

// 📱 Validation téléphone
export const validatePhone = (phone) => {
  if (!phone) {
    return "Le numéro de téléphone est requis";
  }
  
  // Regex pour numéros internationaux (au moins 8 chiffres)
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return "Format de téléphone invalide";
  }
  
  return null; // Pas d'erreur
};

// 🏠 Validation ville
export const validateCity = (city) => {
  if (!city) {
    return "La ville est requise";
  }
  
  if (city.length < 2) {
    return "Le nom de la ville doit contenir au moins 2 caractères";
  }
  
  return null; // Pas d'erreur
};

// 👤 Validation nom
export const validateName = (name) => {
  if (!name) {
    return "Le nom est requis";
  }
  
  if (name.length < 2) {
    return "Le nom doit contenir au moins 2 caractères";
  }
  
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
    return "Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets";
  }
  
  return null; // Pas d'erreur
};

// 🎯 Validation rôle
export const validateRole = (role) => {
  const allowedRoles = ['etudiant', 'formateur'];
  
  if (!role) {
    return "Le rôle est requis";
  }
  
  if (!allowedRoles.includes(role)) {
    return "Rôle invalide sélectionné";
  }
  
  return null; // Pas d'erreur
};
