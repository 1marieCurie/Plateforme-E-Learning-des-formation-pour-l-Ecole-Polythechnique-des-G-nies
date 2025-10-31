/* eslint-disable no-unused-vars */
// src/components/Admin/Stats/PerformanceStats.jsx
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, Users, BookOpen, Award } from "lucide-react";
import api from "@/api/axios";

const PerformanceStats = ({ timeRange }) => {
  const [stats, setStats] = useState(null);
  const [formationStats, setFormationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Données mockées pour les métriques non disponibles (hors temps d'étude moyen/jour)
  const mockStats = {
    coursesPerformance: {
      mostPopular: [
        { name: "Python Développement", students: 85, avgScore: 82.1, completion: 89 },
        { name: "JavaScript Avancé", students: 72, avgScore: 78.5, completion: 85 },
        { name: "React Formation", students: 68, avgScore: 80.2, completion: 87 },
        { name: "Base de données SQL", students: 56, avgScore: 75.8, completion: 79 },
        { name: "DevOps & Docker", students: 43, avgScore: 77.3, completion: 81 }
      ],
      categoriesPerformance: [
        { category: "Développement Web", avgScore: 79.2, students: 156 },
        { category: "Data Science", avgScore: 81.5, students: 89 },
        { category: "DevOps", avgScore: 76.8, students: 67 },
        { category: "Mobile", avgScore: 78.9, students: 54 },
        { category: "Intelligence Artificielle", avgScore: 83.1, students: 32 }
      ]
    },
    trends: {
      scoreImprovement: 5.2,
      completionImprovement: 12.8,
      enrollmentGrowth: 18.5
    }
  };

  useEffect(() => {
    setLoading(true);
    // Appel API pour stats globales formations
    api.get('/formations/global-stats')
      .then(res => setFormationStats(res.data))
      .catch(() => setFormationStats(null));
    // Simuler le reste (mock)
    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const MetricCard = ({ icon: Icon, title, value, unit, trend, description, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
    const trendColor = trend > 0 ? "text-green-600" : "text-red-600";

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {value} <span className="text-lg text-gray-600">{unit}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    );
  };

  const CourseRankingCard = ({ course, rank }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
          {rank}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{course.name}</h4>
          <p className="text-sm text-gray-600">{course.students} étudiants inscrits</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-800">{course.avgScore}%</p>
        <p className="text-sm text-gray-600">{course.completion}% complété</p>
      </div>
    </div>
  );

  const CategoryChart = ({ categories }) => (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800">{category.category}</h4>
            <span className="text-sm text-gray-600">{category.students} étudiants</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${category.avgScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Score moyen: {category.avgScore}%</p>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques de performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon={Award}
          title="Score moyen (progression)"
          value={formationStats?.average_progress !== undefined ? formationStats.average_progress : '--'}
          unit="%"
          trend={stats.trends.scoreImprovement}
          description="Moyenne de progression sur toutes les formations"
          color="green"
        />
        <MetricCard
          icon={BookOpen}
          title="Taux de complétion"
          value={formationStats?.completion_rate !== undefined ? formationStats.completion_rate : '--'}
          unit="%"
          trend={stats.trends.completionImprovement}
          description="Formations terminées (progression 100%)"
          color="blue"
        />
        <MetricCard
          icon={Users}
          title="Étudiants actifs"
          value={formationStats?.total_enrollments !== undefined ? formationStats.total_enrollments : '--'}
          unit=""
          trend={stats.trends.enrollmentGrowth}
          description="Nombre total d'inscriptions en cours"
          color="purple"
        />
      </div>



      {/* Cours les plus populaires */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Cours les plus populaires</h3>
        <div className="space-y-4">
          {stats.coursesPerformance.mostPopular.map((course, index) => (
            <CourseRankingCard key={index} course={course} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Performance par catégorie */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Performance par catégorie</h3>
        <CategoryChart categories={stats.coursesPerformance.categoriesPerformance} />
      </div>
    </div>
  );
};

export default PerformanceStats;