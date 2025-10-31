// src/components/Admin/ManageUsers/UserStats.jsx
import React from "react";
import { Users, UserCheck, UserX, GraduationCap } from "lucide-react";

const UserStats = () => {
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    totalTrainers: 0,
    activeTrainers: 0,
    inactiveTrainers: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      try {
        // Si admin ou super_admin, accès aux vraies stats
        if (user.role === 'admin' || user.role === 'super_admin') {
          // Étudiants
          const resStudents = await fetch('/api/student-profiles', {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            }
          });
          const students = await resStudents.json();
          // Formateurs
          const resTrainers = await fetch('/api/teacher-profiles', {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            }
          });
          const trainers = await resTrainers.json();

          // Calcul stats étudiants
          let totalStudents = Array.isArray(students) ? students.length : 0;
          let activeStudents = 0;
          let inactiveStudents = 0;
          let newStudentsThisMonth = 0;
          const now = new Date();
          students.forEach(profile => {
            const userData = profile.user || {};
            let lastAccess = profile.last_login_at || userData.last_login_at || '';
            let status = 'active';
            if (lastAccess) {
              const lastLogin = new Date(lastAccess);
              const diffMonths = (now - lastLogin) / (1000 * 60 * 60 * 24 * 30);
              if (diffMonths > 1) status = 'inactive';
            }
            if (status === 'active') activeStudents++;
            else inactiveStudents++;
            // Nouveaux inscrits ce mois
            let createdAt = profile.created_at || userData.created_at || null;
            if (createdAt) {
              const createdDate = new Date(createdAt);
              if (createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()) {
                newStudentsThisMonth++;
              }
            }
          });

          // Calcul stats formateurs
          let totalTrainers = Array.isArray(trainers) ? trainers.length : 0;
          let activeTrainers = 0;
          let inactiveTrainers = 0;
          let newTrainersThisMonth = 0;
          trainers.forEach(profile => {
            const userData = profile.user || {};
            let lastAccess = profile.last_login_at || userData.last_login_at || '';
            let status = 'active';
            if (lastAccess) {
              const lastLogin = new Date(lastAccess);
              const diffMonths = (now - lastLogin) / (1000 * 60 * 60 * 24 * 30);
              if (diffMonths > 1) status = 'inactive';
            }
            if (status === 'active') activeTrainers++;
            else inactiveTrainers++;
            let createdAt = profile.created_at || userData.created_at || null;
            if (createdAt) {
              const createdDate = new Date(createdAt);
              if (createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()) {
                newTrainersThisMonth++;
              }
            }
          });

          setStats({
            totalStudents,
            activeStudents,
            inactiveStudents,
            totalTrainers,
            activeTrainers,
            inactiveTrainers,
            newUsersThisMonth: newStudentsThisMonth + newTrainersThisMonth
          });
        } else {
          // Autres rôles : stats vides
          setStats({
            totalStudents: 0,
            activeStudents: 0,
            inactiveStudents: 0,
            totalTrainers: 0,
            activeTrainers: 0,
            inactiveTrainers: 0,
            newUsersThisMonth: 0
          });
        }
      } catch {
        setStats({
          totalStudents: 0,
          activeStudents: 0,
          inactiveStudents: 0,
          totalTrainers: 0,
          activeTrainers: 0,
          inactiveTrainers: 0,
          newUsersThisMonth: 0
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // eslint-disable-next-line no-unused-vars
  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      purple: "bg-purple-500"
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center">
          <div className={`${colorClasses[color]} p-3 rounded-lg mr-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mb-8 text-center text-gray-500">Chargement des statistiques...</div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Users}
        title="Total Étudiants"
        value={stats.totalStudents}
        subtitle={`${stats.activeStudents} actifs`}
        color="blue"
      />
      <StatCard
        icon={UserCheck}
        title="Étudiants Actifs"
        value={stats.activeStudents}
        subtitle="En cours d'apprentissage"
        color="green"
      />
      <StatCard
        icon={GraduationCap}
        title="Total Formateurs"
        value={stats.totalTrainers}
        subtitle={`${stats.activeTrainers} actifs`}
        color="purple"
      />
      <StatCard
        icon={UserX}
        title="Nouveaux ce mois"
        value={stats.newUsersThisMonth}
        subtitle="Inscriptions récentes"
        color="blue"
      />
    </div>
  );
};

export default UserStats;