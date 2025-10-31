// src/components/PasswordStrengthIndicator.jsx

import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const calculateStrength = (password) => {
    let score = 0;
    
    if (!password) return { score: 0, label: '', color: '' };
    
    // Longueur
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Majuscules
    if (/[A-Z]/.test(password)) score += 1;
    
    // Minuscules
    if (/[a-z]/.test(password)) score += 1;
    
    // Chiffres
    if (/[0-9]/.test(password)) score += 1;
    
    // Caractères spéciaux
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 1;
    
    // Définir le niveau et la couleur
    if (score <= 2) return { score, label: 'Faible', color: 'text-red-500' };
    if (score <= 4) return { score, label: 'Moyen', color: 'text-yellow-500' };
    return { score, label: 'Fort', color: 'text-green-500' };
  };
  
  const strength = calculateStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">Force du mot de passe:</span>
        <span className={`font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            strength.score <= 2 ? 'bg-red-500' :
            strength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${(strength.score / 6) * 100}%` }}
        ></div>
      </div>
      
      {/* Critères de validation */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{password.length >= 8 ? '✓' : '○'}</span>
          Au moins 8 caractères
        </div>
        <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
          Une majuscule
        </div>
        <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{/[a-z]/.test(password) ? '✓' : '○'}</span>
          Une minuscule
        </div>
        <div className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{/[0-9]/.test(password) ? '✓' : '○'}</span>
          Un chiffre
        </div>
        <div className={`flex items-center ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          <span className="mr-2">{/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? '✓' : '○'}</span>
          Un caractère spécial
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
