// src/pages/Student/Profile.jsx

import React, { useState, useEffect } from "react";
import ProfileCard from "@/components/Student/Profile/ProfileCard";
import EditProfilePanel from "@/components/Student/Profile/EditProfilePanel";
import axiosInstance from "@/api/axios";
import { getUser } from "@/services/auth";

const Profile = () => {
  const [studentData, setStudentData] = useState(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const user = getUser();
        if (!user || !user.id) {
          console.error("Aucun utilisateur connecté.");
          setError("Aucun utilisateur connecté");
          return;
        }

        const response = await axiosInstance.get(`/student-profiles/${user.id}`);
        
        // Fusionner les données user avec les données du profil
        const mergedData = {
          ...response.data,
          ...response.data.user,
          user_id: response.data.user_id,
        };
        
        setStudentData(mergedData);
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  const handleEditProfile = () => {
    setIsEditPanelOpen(true);
  };

  // Fonction pour déclencher la mise à jour de l'avatar dans le header
  const triggerAvatarUpdate = (newPhoto) => {
    const event = new CustomEvent('profileUpdated', {
      detail: { photo: newPhoto }
    });
    window.dispatchEvent(event);
  };

  const handleSaveProfile = async (formData) => {
    try {
      const formPayload = new FormData();

      // Ajouter toutes les données du formulaire
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formPayload.append(key, formData[key]);
        }
      });

      const response = await axiosInstance.post(
        `/student-profiles/${studentData.user_id}?_method=PUT`,
        formPayload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Mettre à jour les données locales avec la réponse du serveur
      const updatedData = {
        ...studentData,
        ...response.data.user,
        specialite: response.data.student_profile.specialite,
        photo: response.data.student_profile.photo,
      };
      
      setStudentData(updatedData);
      
      // Déclencher la mise à jour de l'avatar dans le header
      if (response.data.student_profile.photo) {
        triggerAvatarUpdate(response.data.student_profile.photo);
      }
      
      console.log("Profil mis à jour avec succès :", response.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      throw error; // Relancer l'erreur pour que le panel puisse la gérer
    }
  };

  const handleProfileUpdate = (updatedData) => {
    // Callback pour mettre à jour les données depuis ProfileCard
    const newData = {
      ...studentData,
      ...updatedData
    };
    
    setStudentData(newData);
    
    // Si l'avatar a été mis à jour, déclencher la mise à jour du header
    if (updatedData.photo) {
      triggerAvatarUpdate(updatedData.photo);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement du profil...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <p className="text-red-600 text-lg">❌ {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  if (!studentData) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-600">Profil introuvable ❌</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">Mon profil</h1>
      
      <ProfileCard 
        student={studentData} 
        onEditProfile={handleEditProfile}
        onProfileUpdate={handleProfileUpdate}
      />
      
      {/* Composants commentés pour l'instant */}
      {/* <ProfileStats stats={null} />
      <RecentCourses recentCourses={null} /> 
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
        <div className="col-span-12 lg:col-span-9">
          <ActivityLog logs={null} />
        </div>
        <div className="col-span-12 lg:col-span-1 flex justify-center">
          <CalendarCard activityDates={null} />
        </div>
      </div> */}

      {/* Panel de modification */}
      <EditProfilePanel
        student={studentData}
        isOpen={isEditPanelOpen}
        onClose={() => setIsEditPanelOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;