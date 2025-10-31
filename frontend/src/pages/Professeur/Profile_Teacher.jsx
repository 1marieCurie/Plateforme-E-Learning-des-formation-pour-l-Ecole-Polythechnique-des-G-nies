import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import ProfileCard_Teacher from "@/components/Teacher/Profile_Teacher/ProfileCard_Teacher";
import EditProfilePanel_Teacher from "@/components/Teacher/Profile_Teacher/EditProfilePanel_Teacher";

const Profile_Teacher = () => {
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const { toast } = useToast();
  
  // Utiliser le hook useTeacherProfile pour récupérer les vraies données
  const { 
    profile: teacherData, 
    loading, 
    error, 
    updateProfile 
  } = useTeacherProfile();

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
        bio: formData.get("bio"),
        experience_years: formData.get("experience_years"),
        linkedin_url: formData.get("linkedin_url"),
        website_url: formData.get("website_url"),
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

  if (!teacherData) {
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
            <span className="bg-green-200 rounded p-2">Mon profil formateur</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles, votre spécialité et consultez vos statistiques d'enseignement.
          </p>
        </div>

        <ProfileCard_Teacher
          user={teacherData}
          onEditProfile={handleEditProfile}
          onProfileUpdate={handleProfileUpdate}
        />

        <EditProfilePanel_Teacher
          teacher={teacherData}
          isOpen={isEditPanelOpen}
          onClose={() => setIsEditPanelOpen(false)}
          onSave={handleSaveProfile}
        />
      </div>
    </div>
  );
};

export default Profile_Teacher;
