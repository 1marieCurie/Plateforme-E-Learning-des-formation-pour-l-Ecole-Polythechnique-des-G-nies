/* eslint-disable no-unused-vars */
// src/components/Admin/Stats/UserActivityStats.jsx
import React, { useState, useEffect } from "react";
import { Users, UserCheck, UserPlus, Clock, Calendar, Activity } from "lucide-react";
import api from "@/api/axios";

const UserActivityStats = ({ timeRange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Données mockées pour devices (non disponibles dans la BD)
  const mockDevices = {
    desktop: 60,
    mobile: 35,
    tablet: 5
  };

  // Données mockées pour avgSessionDuration et totalTime (non disponibles dans la BD)
  const mockSessionDuration = 45; // minutes

  // Détermine si un utilisateur est actif côté UI à partir du champ "lastSeen"
  // Règle: Actif si dernière connexion ≤ 30 jours ("En ligne", minutes, heures, ou "Il y a Xj" avec X ≤ 30)
  const isActiveByLastSeen = (lastSeen) => {
    if (!lastSeen || typeof lastSeen !== 'string') return false;
    const txt = lastSeen.toLowerCase();
    if (txt.includes('en ligne')) return true;
    if (txt.includes('min')) return true; // connecté il y a quelques minutes
    if (txt.includes('h')) return true;   // connecté il y a quelques heures
    const matchDays = txt.match(/il y a\s+(\d+)j/);
    if (matchDays) {
      const days = parseInt(matchDays[1], 10);
      return !Number.isNaN(days) && days <= 30;
    }
    return false;
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Appel à l'API backend avec le paramètre timeRange
        const response = await api.get('/admin/stats/user-activity', {
          params: { timeRange }
        });
        
        setStats(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des statistiques:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const StatCard = ({ icon: Icon, title, value, unit, description, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {value} <span className="text-lg text-gray-600">{unit}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  };


  const TopUsersTable = ({ users }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Utilisateurs les plus actifs</h3>
        <span className="text-xs text-gray-500">Actif si dernière connexion ≤ 30 jours</span>
      </div>
      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune donnée d'activité disponible</p>
        ) : (
          users.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <p className="font-semibold text-gray-800">{user.sessionsCount} sessions</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${isActiveByLastSeen(user.lastSeen) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isActiveByLastSeen(user.lastSeen) ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{user.lastSeen}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques d'activité...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Erreur</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          title="Utilisateurs totaux"
          value={stats.overview.totalUsers}
          unit=""
          description="Tous les comptes créés"
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          title="Utilisateurs actifs"
          value={stats.overview.activeUsers}
          unit=""
          description="Dernière connexion < 30 jours"
          color="green"
        />
        <StatCard
          icon={UserPlus}
          title="Nouveaux utilisateurs"
          value={stats.overview.newUsers}
          unit=""
          description="Inscriptions récentes"
          color="purple"
        />
      </div>

      {/* Statistiques de session */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-800">{stats.connections.avgSessionDuration ? stats.connections.avgSessionDuration : mockSessionDuration}min</p>
          <p className="text-sm text-gray-600">Durée moyenne de session</p>
          {stats.connections.avgSessionDuration ? null : (
            <p className="text-xs text-gray-400 mt-1">(Données simulées)</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-800">{stats.overview.dailyActiveUsers}</p>
          <p className="text-sm text-gray-600">Utilisateurs actifs aujourd'hui</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-800">{stats.connections.totalConnections}</p>
          <p className="text-sm text-gray-600">Connexions totales</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <p className="text-2xl font-bold text-gray-800">{stats.connections.avgConnectionsPerUser}</p>
          <p className="text-sm text-gray-600">Connexions/utilisateur</p>
        </div>
      </div>

      {/* Top utilisateurs actifs */}
      <TopUsersTable users={stats.topActiveUsers} />

      
    </div>
  );
};

export default UserActivityStats;