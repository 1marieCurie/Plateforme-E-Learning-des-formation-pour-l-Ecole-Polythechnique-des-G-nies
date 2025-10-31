// src/components/Admin/Permissions/PermissionGrant.jsx
import React, { useState, useEffect } from "react";
import { X, Search, Shield, User } from "lucide-react";
import "./PermissionGrant.css";
import api from "@/api/axios";

const PermissionGrant = ({ isOpen, onClose, onPromoted }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        // Utiliser axios avec baseURL et Bearer token
        const res = await api.get("/users/non-admins");
        const payload = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data?.data) ? res.data.data : []);
        setUsers(payload);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs non-admins:", error);
        setUsers([]);
      } finally {
        // rien à faire ici
      }
    };
    fetchUsers();
  }, [isOpen]);

  const getDisplayName = (u) => (u.name || u.nom || "");
  const filteredUsers = users.filter(user =>
    getDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Suggestions: au focus, montrer jusqu'à 5 utilisateurs (filtrés si recherche, sinon premiers)
  const listForSuggestions = (searchTerm?.trim()?.length ? filteredUsers : users);
  const suggestions = listForSuggestions.slice(0, 5);
  const showSuggestions = isFocused && suggestions.length > 0;

  const handleGrantPermission = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // Promotion simple: promouvoir en admin normal
      await api.post('/admin/promote', { user_id: selectedUser.id });

      const label = getDisplayName(selectedUser) || selectedUser.email || `ID ${selectedUser.id}`;
      console.log(`Permissions accordées à ${label}`);
      if (typeof onPromoted === 'function') {
        onPromoted(label);
      }
      
      // Réinitialiser et fermer
      setSelectedUser(null);
      setSearchTerm("");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'attribution des permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation: overlay + panel
  return (
    <div className={`grant-panel-overlay${isOpen ? " open" : ""}`}>
      <div className={`grant-panel-content${isOpen ? " slide-in" : ""} w-full max-w-2xl mx-4 h-[85vh] max-h-[90vh] overflow-hidden flex flex-col`}>
  {/* Header */}
  <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Attribuer des permissions d'administrateur
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Fermer le panneau"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

  {/* Content (scrollable area) */}
  <div className="p-6 flex-1 overflow-y-auto min-h-0">
          <p className="text-gray-600 mb-6">
            Sélectionnez un utilisateur à qui vous souhaitez accorder des permissions d'administrateur.
          </p>

          {/* Barre de recherche + suggestions dropdown */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />
            {showSuggestions && (
              <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-56 overflow-y-auto">
                {suggestions.map(user => (
                  <li
                    key={user.id}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchTerm(user.email);
                    }}
                  >
                    <User className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-medium text-gray-800">{user.email}</span>
                    <span className="ml-2 text-xs text-gray-500">{getDisplayName(user) || user.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Liste des utilisateurs */}
          <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {(getDisplayName(user) || user.email || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{getDisplayName(user) || user.email}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {user.role}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {user.created_at ? `Inscrit le ${new Date(user.created_at).toLocaleDateString()}` : null}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Utilisateur sélectionné */}
          {selectedUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Utilisateur sélectionné :</h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(getDisplayName(selectedUser) || selectedUser.email || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">{getDisplayName(selectedUser) || selectedUser.email}</p>
                  <p className="text-sm text-blue-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer (fixed within panel) */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleGrantPermission}
            disabled={!selectedUser || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Attribution en cours...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Accorder les permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionGrant;