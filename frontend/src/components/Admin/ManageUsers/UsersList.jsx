/* eslint-disable no-unused-vars */
// src/components/Admin/ManageUsers/UsersList.jsx
import React, { useState, useEffect } from "react";
import { 
  MoreVertical, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar,
  Users
} from "lucide-react";

// Formatage JJ/MM/AAAA
// Amélioration : gestion des formats string, timestamp, Date
function formatDateFr(dateInput) {
  if (!dateInput) return '—';
  let d = null;
  // Si c'est un nombre (timestamp)
  if (typeof dateInput === 'number') {
    d = new Date(dateInput);
  } else if (typeof dateInput === 'string') {
    // Si format ISO ou MySQL
    // Ex: '2025-10-13T12:34:56Z' ou '2025-10-13 12:34:56'
    // Remplacer espace par T si besoin
    let str = dateInput.replace(' ', 'T');
    // Si pas de fuseau, ajouter 'Z' pour UTC
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
      str += 'Z';
    }
    d = new Date(str);
  } else if (dateInput instanceof Date) {
    d = dateInput;
  }
  if (!d || isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const UsersList = ({ userType, filters }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);


  useEffect(() => {
    setLoading(true);
    const endpoint = userType === "students" ? "/api/student-profiles" : "/api/teacher-profiles";
    const token = localStorage.getItem('token');
    fetch(endpoint, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(data => {
        let mappedUsers = Array.isArray(data) ? data.map(profile => {
          const userData = profile.user || {};
          let lastAccess = profile.last_login_at || userData.last_login_at || '';
          let status = 'active';
          if (lastAccess) {
            const lastLogin = new Date(lastAccess);
            const now = new Date();
            const diffMonths = (now - lastLogin) / (1000 * 60 * 60 * 24 * 30);
            if (diffMonths > 1) status = 'inactive';
          }
          let createdAt = profile.created_at || userData.created_at || null;
          if (!createdAt || createdAt === '0000-00-00 00:00:00' || createdAt === '') createdAt = null;
          return {
            id: userData.id || profile.id,
            name: userData.name || userData.nom || '',
            email: userData.email || '',
            phone: userData.tel || userData.phone || '',
            status,
            lastAccess,
            createdAt,
            coursesCount: profile.coursesCount || 0,
            studentsCount: profile.studentsCount || 0,
            speciality: profile.specialite || '',
            photo: profile.photo || '',
          };
        }) : [];
        setUsers(mappedUsers);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setLoading(false);
      });
  }, [userType]);

  // Filtrage et recherche sur les vraies données
  useEffect(() => {
    let result = [...users];
    // Filtre par statut
    if (filters.status && filters.status !== 'all') {
      result = result.filter(u => u.status === filters.status);
    }
    // Recherche par nom
    if (filters.search && filters.search.trim() !== "") {
      const searchLower = filters.search.trim().toLowerCase();
      result = result.filter(u => u.name && u.name.toLowerCase().includes(searchLower));
    }
    // Tri
    if (filters.sortBy) {
      result = result.sort((a, b) => {
        if (filters.sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else if (filters.sortBy === "lastAccess") {
          return new Date(b.lastAccess || 0) - new Date(a.lastAccess || 0);
        } else if (filters.sortBy === "createdAt") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (filters.sortBy === "email") {
          return a.email.localeCompare(b.email);
        } else if (filters.sortBy === "studentsCount") {
          return (b.studentsCount || 0) - (a.studentsCount || 0);
        }
        return 0;
      });
    }
    setFilteredUsers(result);
  }, [users, filters]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      console.log(`Statut changé pour l'utilisateur ${userId}: ${newStatus}`);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      console.log(`Réinitialisation du mot de passe pour l'utilisateur ${userId}`);
      alert("Email de réinitialisation envoyé !");
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
    }
  };

  const handleAssignTrainer = async (studentId) => {
    // Pour les étudiants seulement
    console.log(`Assigner un formateur à l'étudiant ${studentId}`);
    alert("Fonctionnalité d'assignation à implémenter");
  };

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {user.name.charAt(0)}
            </span>
          </div>
          
          {/* Informations utilisateur */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Mail className="w-4 h-4 mr-1" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Phone className="w-4 h-4 mr-1" />
              <span>{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Statut et actions */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              user.status === "active" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {user.status === "active" ? "Actif" : "Inactif"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Dernier accès: {user.lastAccess ? formatDateFr(user.lastAccess) : '—'}
            </div>
          </div>

          {/* Menu actions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(showActions === user.id ? null : user.id)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showActions === user.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => handleToggleStatus(user.id, user.status)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  {user.status === "active" ? (
                    <>
                      <UserX className="w-4 h-4 mr-2 text-red-500" />
                      Désactiver le compte
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2 text-green-500" />
                      Activer le compte
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleResetPassword(user.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                  Réinitialiser le mot de passe
                </button>

                {userType === "students" && (
                  <button
                    onClick={() => handleAssignTrainer(user.id)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2 text-purple-500" />
                    Assigner un formateur
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
              <span>Inscrit le {user.createdAt ? formatDateFr(user.createdAt) : '—'}</span>
          </div>
          
          <div className="flex items-center">
            {userType === "students" ? (
              <>
                <Users className="w-4 h-4 mr-1" />
                <span>{user.coursesCount} cours suivis</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-1" />
                <span>{user.studentsCount} étudiants • {user.speciality}</span>
              </>
            )}
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
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {userType === "students" ? "Liste des étudiants" : "Liste des formateurs"}
        </h3>
        <span className="text-sm text-gray-600">
          {filteredUsers.length} {userType === "students" ? "étudiant(s)" : "formateur(s)"}
        </span>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersList;