// src/components/Student/Profile/ProfileStats.jsx
import React from "react";

const ProfileStats = ({ stats }) => {
  const cardClass = "bg-white rounded-lg shadow p-4 text-center";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className={cardClass}>
        <p className="text-gray-600">Cours suivis</p>
        <h3 className="text-xl font-bold text-indigo-600">{stats.totalCourses}</h3>
      </div>
      <div className={cardClass}>
        <p className="text-gray-600">Cours complétés</p>
        <h3 className="text-xl font-bold text-green-500">{stats.completedCourses}</h3>
      </div>
      <div className={cardClass}>
        <p className="text-gray-600">Taux de complétion</p>
        <h3 className="text-xl font-bold text-yellow-500">{stats.completionRate}%</h3>
      </div>
      <div className={cardClass}>
        <p className="text-gray-600">Temps d’apprentissage</p>
        <h3 className="text-xl font-bold text-blue-500">{stats.totalHours}h</h3>
      </div>
    </div>
  );
};

export default ProfileStats;
