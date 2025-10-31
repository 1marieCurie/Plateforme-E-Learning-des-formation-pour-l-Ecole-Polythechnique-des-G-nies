// src/components/Admin/Permissions/AdminPermissionsList.jsx
import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Calendar, 
  Mail, 
  MoreVertical,
  Trash2,
  Crown
} from "lucide-react";

const AdminPermissionsList = ({ reloadSignal = 0 }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActions, setShowActions] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const getDisplayName = (u) => (u?.name || u?.nom || "");
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.is_super_admin === true;


  useEffect(() => {
    // Appel API réel pour récupérer les administrateurs
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admins');
        const data = response.data;

        // Normaliser et trier: super_admins d'abord, puis admins
        const arr = Array.isArray(data) ? data : [];
        const normalized = arr.map((u) => ({
          ...u,
          // Assurer un champ name pour l'affichage
          name: u.name || u.nom || "",
          // Drapeau visuel pour le badge/couronne
          isMainAdmin: Boolean(u.is_super_admin) || u.role === 'super_admin',
          // Fallbacks simples pour dates d'affichage
          grantedAt: u.grantedAt || u.created_at || u.updated_at || null,
          lastAccess: u.last_login_at || u.updated_at || u.created_at || null,
        }));

        normalized.sort((a, b) => {
          // super_admin en premier
          if (a.isMainAdmin && !b.isMainAdmin) return -1;
          if (!a.isMainAdmin && b.isMainAdmin) return 1;
          // puis tri alphabétique par nom/email
          const aLabel = getDisplayName(a) || a.email || "";
          const bLabel = getDisplayName(b) || b.email || "";
          return aLabel.localeCompare(bLabel);
        });

        setAdmins(normalized);
      } catch (error) {
        console.error(error);
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [reloadSignal]);

  const openConfirmRevoke = (admin) => {
    if (!isSuperAdmin) return;
    setShowActions(null);
    setConfirmAdmin(admin || null);
    setShowConfirm(true);
  };

  const doRevokePermission = async () => {
    if (!isSuperAdmin || !confirmAdmin?.id) return;
    try {
      await api.post('/admin/revoke', { user_id: confirmAdmin.id });
      setAdmins((prev) => prev.filter((a) => a.id !== confirmAdmin.id));
      setShowConfirm(false);
      setConfirmAdmin(null);
      // Toast succès
      setToastMessage('Permissions révoquées: l’utilisateur est redevenu formateur.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
      setShowConfirm(false);
      setConfirmAdmin(null);
      alert(error?.response?.data?.error || error?.response?.data?.message || 'Révocation impossible.');
    }
  };

  const AdminCard = ({ admin }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar avec icône admin */}
          <div className="relative">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {(getDisplayName(admin) || admin.email || "?").charAt(0)}
              </span>
            </div>
            {admin.isMainAdmin && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          {/* Informations admin */}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-800">{getDisplayName(admin) || admin.email}</h3>
              {admin.isMainAdmin && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                  Admin Principal
                </span>
              )}
            </div>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Mail className="w-4 h-4 mr-1" />
              <span>{admin.email}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Shield className="w-4 h-4 mr-1" />
              <span>Permissions accordées par {admin.grantedBy}</span>
            </div>
          </div>
        </div>

        {/* Statut et actions */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Administrateur Actif
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Dernier accès: {new Date(admin.lastAccess).toLocaleDateString()}
            </div>
          </div>

          {/* Menu actions (seulement si ce n'est pas l'admin principal) */}
          {isSuperAdmin && !admin.isMainAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowActions(showActions === admin.id ? null : admin.id)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showActions === admin.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={() => openConfirmRevoke(admin)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Révoquer les permissions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Permissions accordées le {new Date(admin.grantedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des administrateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Administrateurs actuels
        </h3>
        <span className="text-sm text-gray-600">
          {admins.length} administrateur(s)
        </span>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun administrateur trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {admins.map(admin => (
            <AdminCard key={admin.id} admin={admin} />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-100 transition-opacity"
            onClick={() => { setShowConfirm(false); setConfirmAdmin(null); }}
          />
          {/* Modal content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all duration-200 ease-out scale-100 opacity-100">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">
                <ShieldX className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Révoquer les permissions ?</h4>
            </div>
            <p className="text-gray-600 mb-6">
              Cette action retirera les privilèges d’administrateur à
              {" "}
              <span className="font-medium text-gray-800">
                {getDisplayName(confirmAdmin) || confirmAdmin?.email}
              </span>{" "}
              et le rendra à nouveau <span className="font-medium">formateur</span>.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowConfirm(false); setConfirmAdmin(null); }}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={doRevokePermission}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Oui, révoquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
            {toastMessage || 'Action réussie.'}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPermissionsList;