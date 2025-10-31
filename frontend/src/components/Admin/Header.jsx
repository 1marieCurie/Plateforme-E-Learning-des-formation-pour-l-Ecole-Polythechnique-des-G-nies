// src/components/Admin/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Common/UserMenu";
import SettingsMenu from "../Common/UserMenu";
import DarkModeToggle from "../Common/UserMenu";
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useUserAvatar } from "../../hooks/useUserAvatar";

const Header = ({ userName = "Administrateur" }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // ✅ Utiliser le contexte d'auth
  const userAvatar = useUserAvatar(); // 🎯 Récupérer l'avatar dynamique

  const toggleMenu = (menu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

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
        {userName}
      </h1>

      <div className="relative flex items-center space-x-4 sm:space-x-6">
        <SettingsMenu isOpen={activeMenu === "settings"} onToggle={() => toggleMenu("settings")} />
        <DarkModeToggle />
        <UserMenu
          isOpen={activeMenu === "user"}
          onToggle={() => toggleMenu("user")}
          onLogout={handleLogout}
          userAvatar={userAvatar} // 🎯 Passer l'avatar dynamique
        />
      </div>
    </header>
  );
};

export default Header;
