/* eslint-disable no-unused-vars */
// src/components/Admin/Stats/CourseStats.jsx
import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp, Users, Award, Eye } from "lucide-react";
import api from '@/api/axios';
import { courseService } from '@/services/courseService';

function CourseStats({ timeRange }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/courses'),
      api.get('/student-feedbacks/stats')
    ]).then(([coursesRes, feedbackRes]) => {
      const courses = coursesRes.data.data || [];
      // Overview
      const totalCourses = courses.length;
      const activeCourses = courses.filter(c => c.is_active).length;
      // Calculer les inscriptions uniques par formation (éviter les doublons si plusieurs cours de la même formation)
      const formationsMap = new Map();
      courses.forEach(c => {
        if (c.formation?.id) {
          formationsMap.set(c.formation.id, c.formation.enrolled_students || 0);
        }
      });
      const totalEnrollments = Array.from(formationsMap.values()).reduce((sum, count) => sum + count, 0);
  // Completion rate: moyenne des avgProgress
      const completionRate = courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.avgProgress || 0), 0) / courses.length) : 0;
      // Note moyenne
      const avgRating = feedbackRes.data.average_rating || '--';
  // Total views
      const totalViews = courses.reduce((sum, c) => sum + (c.views || 0), 0) || 0;

      // Popular courses: top 5 par nombre d'inscrits
      const popularCourses = [...courses]
        .sort((a, b) => (b.formation?.enrolled_students || 0) - (a.formation?.enrolled_students || 0))
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          name: c.title,
          category: c.category?.nom || '',
          enrollments: c.formation?.enrolled_students || 0,
          completions: Math.round((c.avgProgress || 0) * (c.formation?.enrolled_students || 0) / 100),
          avgScore: c.avgScore || 0,
          rating: avgRating,
          views: c.views || 0,
          duration: c.duration_minutes ? `${Math.round(c.duration_minutes / 60)}h` : '--'
        }));

      // Catégories
      const categoriesMap = {};
      courses.forEach(c => {
        const cat = c.category?.nom || 'Autre';
        if (!categoriesMap[cat]) {
          categoriesMap[cat] = { category: cat, courses: 0, enrollments: 0, avgRating: avgRating, completionRate: 0 };
        }
        categoriesMap[cat].courses += 1;
        categoriesMap[cat].enrollments += c.formation?.enrolled_students || 0;
        categoriesMap[cat].completionRate += c.avgProgress || 0;
      });
      const categoryStats = Object.values(categoriesMap).map(cat => ({
        ...cat,
        completionRate: cat.courses > 0 ? Math.round(cat.completionRate / cat.courses) : 0,
        color: 'bg-blue-500' // UI only
      }));

      setStats({
        overview: {
          totalCourses,
          activeCourses,
          totalEnrollments,
          completionRate: Math.round(completionRate),
          avgRating,
          totalViews
        },
        popularCourses,
        categoryStats,
        trends: {
          enrollmentGrowth: '--', // À calculer avec historique
          completionImprovement: '--' // À calculer avec historique
        }
      });
      setLoading(false);
      setError(null);
    }).catch(err => {
      console.error('Error loading course stats', err);
      setError('Erreur lors du chargement des statistiques');
      setLoading(false);
    });
  }, [timeRange]);

  const StatCard = ({ icon: Icon, title, value, unit, trend, description, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend !== undefined && trend !== null && (
            <div className="flex items-center space-x-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{trend}%</span>
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

  const CourseCard = ({ course, rank }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
            {rank}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{course.name}</h4>
            <p className="text-sm text-gray-600">{course.category}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{course.duration}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-600">{course.enrollments}</p>
          <p className="text-xs text-gray-600">Inscrits</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">{course.completions}</p>
          <p className="text-xs text-gray-600">Complétés</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-600">{Math.round((course.enrollments > 0 ? (course.completions / course.enrollments) * 100 : 0))}%</p>
          <p className="text-xs text-gray-600">Taux de réussite</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-yellow-600">{course.views}</p>
          <p className="text-xs text-gray-600">Vues</p>
        </div>
      </div>
    </div>
  );

  const CategoryChart = ({ categories }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Performance par catégorie</h3>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 ${category.color} rounded`}></div>
                <span className="font-medium text-gray-800">{category.category}</span>
              </div>
              <span className="text-sm text-gray-600">
                {category.courses} cours • {category.enrollments} inscrits
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 ml-7">
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${category.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Complétion: {category.completionRate}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{category.avgRating}</p>
                <p className="text-xs text-gray-600">★ Note moyenne</p>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{category.enrollments}</p>
                <p className="text-xs text-gray-600">Total inscrits</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques de cours...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>{error || 'Impossible de charger les statistiques'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total des cours"
          value={stats?.overview?.totalCourses}
          description="Cours disponibles sur la plateforme"
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Inscriptions totales"
          value={stats?.overview?.totalEnrollments}
          description="Étudiants inscrits aux formations"
          color="green"
        />
        <StatCard
          icon={Award}
          title="Taux de réussite"
          value={stats?.overview?.completionRate}
          description="Cours terminés avec succès"
          color="purple"
        />
      </div>

      {/* Statistiques détaillées */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <StatCard
            icon={BookOpen}
            title="Cours actifs"
            value={stats?.overview?.activeCourses}
            description="Cours actuellement disponibles"
            color="blue"
          />
          <StatCard
            icon={Eye}
            title="Vues totales"
            value={stats?.overview?.totalViews}
            description="Nombre total de consultations"
            color="green"
          />
        </div>
      </div>

      {/* Cours les plus populaires */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Cours les plus populaires</h3>
        <div className="space-y-4">
          {stats?.popularCourses?.map((course, index) => (
            <CourseCard key={course.id} course={course} rank={index + 1} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default CourseStats;