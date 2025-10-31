import React from "react";
import { useNavigate } from "react-router-dom";
// ...existing code...
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';


const Header = ({ userName = "Formateur" }) => {
 
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext); // ✅ Utiliser le contexte d'auth
 
  // Utiliser le nom réel de l'utilisateur si disponible
  const displayName = user?.nom || userName;


  const handleLogout = async () => {
    try {
      await logout(); // ✅ Utiliser la méthode du contexte
      navigate("/"); // ✅ Rediriger vers la page d'accueil
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      navigate("/"); // Rediriger même en cas d'erreur
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow px-6 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
        {displayName}
      </h1>

      <div className="flex items-center">
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-2 bg-blue-400 hover:bg-blue-600 text-white rounded-lg font-medium shadow transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
};

export default Header;
