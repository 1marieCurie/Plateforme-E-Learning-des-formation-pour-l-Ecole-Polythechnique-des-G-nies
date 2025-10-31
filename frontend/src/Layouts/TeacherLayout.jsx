// src/layouts/TeacherLayout.jsx
import React from "react";
import SidebarMenu from "../components/Teacher/SideBarMenu";
import { Outlet } from "react-router-dom";
import Header from "@/components/Teacher/Header/Header";

const TeacherLayout = () => {
  return (
    <div className="flex min-h-screen bg-indigo-50 dark:bg-gray-900">
      {/* Sidebar gauche */}
      <SidebarMenu />

      {/* Contenu principal à droite */}
      <div className="flex-1 flex flex-col">
        {/* Header sticky */}
        <Header userName ="Lina Ben Ali" />

        {/* Contenu de la page */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
