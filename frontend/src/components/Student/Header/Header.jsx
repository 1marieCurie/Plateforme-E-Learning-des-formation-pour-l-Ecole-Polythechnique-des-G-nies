// src/components/Student/Header/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const Header = ({ userName = "Étudiant" }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow px-6 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
        {userName}
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