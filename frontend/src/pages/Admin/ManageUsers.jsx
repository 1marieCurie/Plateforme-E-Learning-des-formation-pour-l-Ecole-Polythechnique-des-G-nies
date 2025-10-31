// src/pages/Admin/ManageUsers.jsx
import React, { useState } from "react";
import UsersList from "@/components/Admin/ManageUsers/UsersList";
import UserFilters from "@/components/Admin/ManageUsers/UserFilters";
import UserStats from "@/components/Admin/ManageUsers/UserStats";

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [filters, setFilters] = useState({
    search: "",
    status: "all", // all, active, inactive
    sortBy: "name" // name, email, lastAccess
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">
        <span className="bg-blue-200 rounded p-2">Gestion des utilisateurs</span>
      </h1>

      <p className="text-gray-700 mb-8">
        Gérez les comptes étudiants et formateurs de votre plateforme. Vous pouvez activer/désactiver des comptes, réinitialiser les mots de passe et assigner des rôles.
      </p>

      {/* Statistiques générales */}
      <UserStats />

      {/* Navigation des onglets */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === "students"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Étudiants
        </button>
        <button
          onClick={() => setActiveTab("trainers")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === "trainers"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Formateurs
        </button>
      </div>

      {/* Filtres */}
      <UserFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        userType={activeTab}
      />

      {/* Liste des utilisateurs */}
      <UsersList 
        userType={activeTab}
        filters={filters}
      />
    </>
  );
};

export default ManageUsers;