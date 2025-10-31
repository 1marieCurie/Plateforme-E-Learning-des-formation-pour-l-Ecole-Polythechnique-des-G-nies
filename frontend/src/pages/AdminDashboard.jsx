import { Link } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  UserCheck, 
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {

  // Etats pour les statistiques réelles
  const [userStats, setUserStats] = useState(null);
  const [userStatsError, setUserStatsError] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(true);
  const [courseStats, setCourseStats] = useState(null);
  const [courseStatsLoading, setCourseStatsLoading] = useState(true);

  useEffect(() => {
    setUserStatsLoading(true);
    setUserStatsError(null);
    api.get("/admin/stats/user-activity")
      .then(res => setUserStats(res.data))
      .catch(() => {
        setUserStatsError("Impossible de charger les données");
      })
      .finally(() => setUserStatsLoading(false));
    
    // Charger les stats des cours (même logique que CourseStats.jsx)
    setCourseStatsLoading(true);
    Promise.all([
      api.get('/courses'),
      api.get('/student-feedbacks/stats')
    ]).then(([coursesRes]) => {
      const courses = coursesRes.data.data || [];
      const totalCourses = courses.length;
      setCourseStats({ overview: { totalCourses } });
      setCourseStatsLoading(false);
    }).catch(() => {
      setCourseStats({ overview: { totalCourses: 0 } });
      setCourseStatsLoading(false);
    });
  }, []);


  const DashboardCard = ({ title, children, link, linkText = "Voir plus" }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {link && (
          <Link to={link} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 transition-colors">
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="bg-blue-200 rounded p-2">Tableau de bord administrateur</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de votre plateforme éducative
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Utilisateurs inscrits */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisateurs inscrits</p>
                {userStatsLoading ? (
                  <p className="text-sm text-gray-400">Chargement...</p>
                ) : userStatsError ? (
                  <p className="text-xs text-red-600">{userStatsError}</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{userStats?.overview?.totalUsers ?? '-'}</p>
                )}
              </div>
            </div>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {/* Cours publiés */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cours publiés</p>
                {courseStatsLoading ? (
                  <p className="text-sm text-gray-400">Chargement...</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{courseStats?.overview?.totalCourses ?? '-'}</p>
                )}
              </div>
            </div>
            <Link to="/admin/stats_tech" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {/* Utilisateurs actifs */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                {userStatsLoading ? (
                  <p className="text-sm text-gray-400">Chargement...</p>
                ) : userStatsError ? (
                  <p className="text-xs text-red-600">{userStatsError}</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{userStats?.overview?.activeUsers ?? '-'}</p>
                )}
              </div>
            </div>
            <Link to="/admin/stats_tech" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Sections principales - Accès rapide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Statistiques techniques */}
          <DashboardCard title="Statistiques techniques" link="/admin/stats_tech">
            <div className="space-y-4">
              <p className="text-gray-600">
                Consultez les statistiques détaillées sur les cours, utilisateurs et activités de la plateforme.
              </p>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Statistiques des cours</span>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Activité des utilisateurs</span>
                <ArrowRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </DashboardCard>

          {/* Gestion des permissions */}
          <DashboardCard title="Gestion des permissions" link="/admin/permissions">
            <div className="space-y-4">
              <p className="text-gray-600">
                Gérez les rôles et permissions d'accès des utilisateurs de la plateforme.
              </p>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Configuration des rôles</span>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Gestion des permissions</span>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </DashboardCard>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;