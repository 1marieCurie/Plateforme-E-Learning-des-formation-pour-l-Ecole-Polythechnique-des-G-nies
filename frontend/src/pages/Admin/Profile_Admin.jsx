import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import ProfileCard from "@/components/Admin/Profile_Admin/ProfileCard_Admin";
import EditProfilePanel from "@/components/Admin/Profile_Admin/EditProfilePanel";


const Profile_Admin = () => {
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const { toast } = useToast();
  
  // Utiliser le hook useAdminProfile pour récupérer les vraies données
  const { 
    profile: adminData, 
    loading, 
    error, 
    updateProfile 
  } = useAdminProfile();

  const handleEditProfile = () => {
    setIsEditPanelOpen(true);
  };

  const triggerAvatarUpdate = (newPhoto) => {
    const event = new CustomEvent("profileUpdated", {
      detail: { photo: newPhoto }
    });
    window.dispatchEvent(event);
  };

  const handleSaveProfile = async (formData) => {
    try {
      console.log("Données reçues du formulaire :", Object.fromEntries(formData.entries()));

      // Préparer les données pour l'API
      const profileData = {
        nom: formData.get("nom"),
        email: formData.get("email"),
        tel: formData.get("tel"),
        naissance: formData.get("naissance"),
        ville: formData.get("ville"),
        villeOrigine: formData.get("villeOrigine"),
        specialite: formData.get("specialite"),
        photo: formData.get("photo")
      };

      // Remove undefined values
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined || profileData[key] === null) {
          delete profileData[key];
        }
      });

      // Utiliser le hook pour mettre à jour le profil
      await updateProfile(profileData);

      if (profileData.photo) {
        triggerAvatarUpdate(profileData.photo);
      }

      console.log("Profil mis à jour avec succès");

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du profil",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      await updateProfile(updatedData);

      if (updatedData.photo) {
        triggerAvatarUpdate(updatedData.photo);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Profil introuvable</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            <span className="bg-blue-200 rounded p-2">Mon profil administrateur</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et consultez l'historique de vos connexions à la plateforme.
          </p>
        </div>

        <ProfileCard
          user={adminData}
          onEditProfile={handleEditProfile}
          onProfileUpdate={handleProfileUpdate}
        />


        <EditProfilePanel
          admin={adminData}
          isOpen={isEditPanelOpen}
          onClose={() => setIsEditPanelOpen(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
};

export default Profile_Admin;
