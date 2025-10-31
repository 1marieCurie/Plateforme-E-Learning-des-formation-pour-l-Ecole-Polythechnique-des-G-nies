// src/components/Layout/SettingsMenu.jsx
import React from "react";
import { FiSettings, FiGlobe, FiImage, FiBell } from "react-icons/fi";

const SettingsMenu = ({ isOpen, onToggle }) => {
  return (
    <div className="relative">
      {/* Bouton icône paramètres */}
      <button
        onClick={onToggle}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <FiSettings className="text-xl" />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 shadow-lg rounded-md z-50">
          <ul className="text-sm text-gray-700 dark:text-gray-200">
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <FiGlobe /> Langue
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <FiImage /> Thème
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <FiBell /> Notifications
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;
