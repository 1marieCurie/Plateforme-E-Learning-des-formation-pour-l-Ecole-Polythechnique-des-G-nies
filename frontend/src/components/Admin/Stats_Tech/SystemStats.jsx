/* eslint-disable no-unused-vars */
// src/components/Admin/Stats/SystemStats.jsx
import React, { useState, useEffect } from "react";
import { Server, Database, Wifi, HardDrive, Cpu, Activity } from "lucide-react";

const SystemStats = ({ timeRange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Données mockées
  const mockStats = {
    serverHealth: {
      status: "healthy",
      uptime: "99.9%",
      lastRestart: "2024-01-10T08:00:00"
    },
    resources: {
      cpu: { usage: 45, max: 100 },
      memory: { usage: 6.2, max: 16 },
      storage: { usage: 120, max: 500 },
      bandwidth: { usage: 850, max: 1000 }
    },
    performance: {
      avgResponseTime: 250,
      requestsPerSecond: 45,
      errorRate: 0.02,
      totalRequests: 125000
    },
    database: {
      connections: 25,
      maxConnections: 100,
      queryTime: 15,
      slowQueries: 3
    }
  };

  useEffect(() => {
    setLoading(true);
    // Simuler l'appel API
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const StatCard = ({ icon: Icon, title, value, unit, status, description, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    const statusColors = {
      good: "text-green-600 bg-green-100",
      warning: "text-yellow-600 bg-yellow-100",
      critical: "text-red-600 bg-red-100"
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${colorClasses[color]} p-3 rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {status === "good" ? "Bon" : status === "warning" ? "Attention" : "Critique"}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {value} <span className="text-lg text-gray-600">{unit}</span>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ label, value, max, unit, color = "blue" }) => {
    const percentage = (value / max) * 100;
    const colorClass = percentage > 80 ? "bg-red-500" : percentage > 60 ? "bg-yellow-500" : "bg-green-500";

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-800">{label}</h4>
          <span className="text-sm text-gray-600">
            {value} / {max} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">{percentage.toFixed(1)}% utilisé</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statut général du serveur */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">État du serveur</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">En ligne</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.serverHealth.uptime}</p>
            <p className="text-sm text-gray-600">Temps de fonctionnement</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {Math.floor((Date.now() - new Date(stats.serverHealth.lastRestart).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-sm text-gray-600">Jours depuis redémarrage</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.performance.requestsPerSecond}</p>
            <p className="text-sm text-gray-600">Requêtes/sec</p>
          </div>
        </div>
      </div>

      {/* Utilisation des ressources */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Utilisation des ressources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressBar
            label="Processeur (CPU)"
            value={stats.resources.cpu.usage}
            max={stats.resources.cpu.max}
            unit="%"
          />
          <ProgressBar
            label="Mémoire (RAM)"
            value={stats.resources.memory.usage}
            max={stats.resources.memory.max}
            unit="GB"
          />
          <ProgressBar
            label="Stockage"
            value={stats.resources.storage.usage}
            max={stats.resources.storage.max}
            unit="GB"
          />
          <ProgressBar
            label="Bande passante"
            value={stats.resources.bandwidth.usage}
            max={stats.resources.bandwidth.max}
            unit="Mbps"
          />
        </div>
      </div>

      {/* Statistiques de performance */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Performances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            title="Temps de réponse"
            value={stats.performance.avgResponseTime}
            unit="ms"
            status="good"
            description="Temps moyen de réponse"
            color="green"
          />
          <StatCard
            icon={Wifi}
            title="Requêtes totales"
            value={stats.performance.totalRequests.toLocaleString()}
            unit=""
            status="good"
            description="Depuis le début"
            color="blue"
          />
          <StatCard
            icon={Server}
            title="Taux d'erreur"
            value={stats.performance.errorRate}
            unit="%"
            status="good"
            description="Erreurs/total requêtes"
            color="yellow"
          />
          <StatCard
            icon={Database}
            title="Connexions DB"
            value={stats.database.connections}
            unit={`/${stats.database.maxConnections}`}
            status="good"
            description="Connexions actives"
            color="purple"
          />
        </div>
      </div>

      {/* Base de données */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Base de données</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.database.queryTime}ms</p>
            <p className="text-sm text-gray-600">Temps de requête moyen</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <HardDrive className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">
              {stats.database.connections}/{stats.database.maxConnections}
            </p>
            <p className="text-sm text-gray-600">Connexions utilisées</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Cpu className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{stats.database.slowQueries}</p>
            <p className="text-sm text-gray-600">Requêtes lentes détectées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;