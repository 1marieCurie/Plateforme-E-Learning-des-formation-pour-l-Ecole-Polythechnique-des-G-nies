// src/pages/Admin/Permissions.jsx
import React, { useState } from "react";
import AdminPermissionsList from "@/components/Admin/Permissions/AdminPermissionsList";
import PermissionGrant from "@/components/Admin/Permissions/PermissionGrant";
import "@/components/Admin/Permissions/PermissionGrant.css";

const Permissions = () => {
  const [showGrantPanel, setShowGrantPanel] = useState(false);
  const [reloadAdmins, setReloadAdmins] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // À adapter selon ton système d'authentification
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role === 'super_admin';

  const handlePromoted = (label) => {
    // Déclenche un toast succès + refresh de la liste admin
    setToastMessage(`Utilisateur promu en administrateur: ${label}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    setReloadAdmins((v) => v + 1);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">
        <span className="bg-blue-200 rounded p-2">Gestion des permissions</span>
      </h1>

      <p className="text-gray-700 mb-8">
        Gérez les permissions administratives. Vous pouvez attribuer ou retirer les droits d'administration à d'autres utilisateurs.
      </p>

      {/* Bouton pour ajouter un nouvel admin (super admin uniquement) */}
      {isSuperAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowGrantPanel(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Attribuer des permissions d'administrateur
          </button>
        </div>
      )}

      {/* Liste des administrateurs actuels */}
  <AdminPermissionsList reloadSignal={reloadAdmins} />

      {/* Panel pour attribuer des permissions */}
      <PermissionGrant 
        isOpen={showGrantPanel}
        onClose={() => setShowGrantPanel(false)}
        onPromoted={handlePromoted}
      />

      {/* Success Toast (promotion) */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
            {toastMessage || 'Action réussie.'}
          </div>
        </div>
      )}
    </>
  );
};

export default Permissions;