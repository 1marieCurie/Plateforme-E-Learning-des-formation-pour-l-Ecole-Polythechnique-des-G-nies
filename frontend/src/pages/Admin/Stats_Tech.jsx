// src/pages/Admin/Stats_Tech.jsx
import React, { useState } from "react";
import { Activity, LineChart, Cpu, BookOpen } from "lucide-react";
import SystemStats from "@/components/Admin/Stats_Tech/SystemStats";
import PerformanceStats from "@/components/Admin/Stats_Tech/PerformanceStats";
import UserActivityStats from "@/components/Admin/Stats_Tech/UserActivityStats";
import CourseStats from "@/components/Admin/Stats_Tech/CourseStats";

const Stats_Tech = () => {
  const [activeTab, setActiveTab] = useState("system");
  const [timeRange, setTimeRange] = useState(7); // Nombre de jours

  const tabs = [
    { key: "system", label: "Système", icon: Cpu },
    { key: "performance", label: "Performances", icon: LineChart },
    { key: "activity", label: "Activité", icon: Activity },
    { key: "courses", label: "Cours", icon: BookOpen }
  ];

  const timeRanges = [
    { key: 1, label: "24 heures" },
    { key: 7, label: "7 jours" },
    { key: 30, label: "30 jours" },
    { key: 90, label: "90 jours" }
  ];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">
        <span className="bg-blue-200 rounded p-2">Statistiques techniques</span>
      </h1>

      <p className="text-gray-700 mb-8">
        Consultez les performances du système, l'activité des utilisateurs et les statistiques des cours pour optimiser votre plateforme.
      </p>

      {/* Sélecteur de période */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Période :</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.key} value={range.key}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="space-y-6">
        {activeTab === "system" && <SystemStats timeRange={timeRange} />}
        {activeTab === "performance" && <PerformanceStats timeRange={timeRange} />}
        {activeTab === "activity" && <UserActivityStats timeRange={timeRange} />}
        {activeTab === "courses" && <CourseStats timeRange={timeRange} />}
      </div>
    </>
  );
};

export default Stats_Tech;