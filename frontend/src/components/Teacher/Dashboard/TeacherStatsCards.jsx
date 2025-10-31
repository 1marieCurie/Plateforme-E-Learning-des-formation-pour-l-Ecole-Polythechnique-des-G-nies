// src/components/Teacher/Dashboard/TeacherStatsCards.jsx

import React from "react";
import { FiBookOpen, FiUsers } from "react-icons/fi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { AiFillStar } from "react-icons/ai";

const statsIcons = {
  courses: <FiBookOpen className="text-indigo-500 text-2xl" />,
  students: <FiUsers className="text-green-500 text-2xl" />,
  certificates: <HiOutlineBadgeCheck className="text-blue-500 text-2xl" />,
  averageRating: <AiFillStar className="text-yellow-400 text-2xl" />,
};

const TeacherStatsCards = ({ stats }) => {
  return (
    <div className="flex justify-center mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={statsIcons.courses}
          label="Total cours"
          value={stats.totalCourses}
        />
        <StatCard
          icon={statsIcons.students}
          label="Total étudiants"
          value={stats.totalStudents}
        />
        <StatCard
          icon={statsIcons.averageRating}
          label="Note moyenne"
          value={`${stats.averageRating} / 5`}
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-4 hover:shadow-lg transition-all">
      <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
  );
};

export default TeacherStatsCards;
