// src/components/Common/UserMenu.jsx

import { FiUser, FiShield, FiLogOut } from "react-icons/fi";
import  { useNavigate } from "react-router-dom";
import React from "react";
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const UserMenu = ({ isOpen, onToggle, onLogout }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleProfileClick = () => {
  let profilePath = "/unauthorized"; // par défaut

  if (user?.role === "admin") {
    profilePath = "/admin/profile";
  } else if (user?.role === "etudiant") {
    profilePath = "/student/profile";
  } else if (user?.role === "formateur") {
    profilePath = "/teacher/profile"; // à adapter si cette page existe
  }

  navigate(profilePath);
  onToggle();
};



  return (
    <div className="relative">
      {/* Avatar bouton */}
      <button
        onClick={onToggle}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 hover:border-blue-400 transition-colors"
        title="Menu utilisateur"
      >
        <img
          src={
            user?.photo?.startsWith("avatar")
              ? `/avatars/${user?.photo}`
              : user?.photo
                ? `/storage/${user.photo}`
                : "/avatars/avatar1.svg"
          }
          alt="Avatar utilisateur"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/avatars/avatar1.svg";
          }}
        />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50 border border-gray-200 dark:border-gray-700">
          <ul className="text-sm text-gray-700 dark:text-gray-200">
            <li 
              onClick={handleProfileClick}
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <FiUser className="w-4 h-4" /> 
              Mon profil
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <FiShield className="w-4 h-4" /> 
              Confidentialité
            </li>
            <li
              onClick={onLogout}
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-500 dark:text-red-400 transition-colors border-t border-gray-200 dark:border-gray-600"
            >
              <FiLogOut className="w-4 h-4" /> 
              Se déconnecter
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;