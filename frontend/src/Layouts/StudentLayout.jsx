import React, { useState, useEffect } from "react";
import SidebarMenu from "../components/Student/SideBarMenu";
import { Outlet } from "react-router-dom";
import Header from "@/components/Student/Header/Header";
import { getUser } from "@/services/auth";
import axiosInstance from "@/api/axios";

const StudentLayout = () => {
  const [userData, setUserData] = useState({
    nom: "Étudiant",
    photo: "avatar1.svg" // avatar par défaut
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = getUser();
        if (!user || !user.id) return;

        const response = await axiosInstance.get('/my-student-profile');
        const data = response.data;
        
        setUserData({
          nom: data.user?.nom || data.user?.name || "Étudiant",
          photo: data.photo || "avatar1.svg"
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
      }
    };

    fetchUserData();

    // Écouter les changements d'avatar depuis le localStorage ou un event
    const handleProfileUpdate = (event) => {
      if (event.detail && event.detail.photo) {
        setUserData(prev => ({
          ...prev,
          photo: event.detail.photo
        }));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-indigo-50 dark:bg-gray-900">
      <SidebarMenu />
      <div className="flex-1 flex flex-col">
        {/* Header étudiant avec avatar dynamique */}
        <Header 
          userName={userData.nom} 
          userAvatar={userData.photo}
        />

        {/* Contenu principal */}
        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;