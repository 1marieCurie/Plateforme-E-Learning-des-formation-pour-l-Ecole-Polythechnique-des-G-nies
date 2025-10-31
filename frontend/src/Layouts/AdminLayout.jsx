// src/layouts/AdminLayout.jsx
import React from "react";
import SidebarMenu from "../components/Admin/SidebarMenu";
import { Outlet } from "react-router-dom";
import Header from "@/components/Student/Header/Header";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarMenu />
      <div className="flex-1 flex flex-col">
        <Header userName="Admin Panel" />
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
