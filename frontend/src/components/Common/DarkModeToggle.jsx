// src/components/Layout/DarkModeToggle.jsx
import React, { useEffect, useState } from "react";
import { FaRegMoon, FaSun } from "react-icons/fa";

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Lire le thème stocké au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (
      savedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches
    );

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Appliquer le thème quand darkMode change
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="text-gray-700 dark:text-gray-200 text-xl hover:text-indigo-500 transition"
      title="Changer le thème"
    >
      {darkMode ? <FaSun /> : <FaRegMoon />}
    </button>
  );
};

export default DarkModeToggle;
