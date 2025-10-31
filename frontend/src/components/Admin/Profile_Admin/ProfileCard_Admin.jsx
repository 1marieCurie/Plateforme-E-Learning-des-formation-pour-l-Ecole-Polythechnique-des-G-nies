import { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProfileCard_Admin = ({ user, onEditProfile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    tel: "",
    naissance: "",
    ville: "",
    villeOrigine: "",
    specialite: "",
    photo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        email: user.email || "",
        tel: user.tel || "",
        naissance: user.naissance || "",
        ville: user.ville || "",
        villeOrigine: user.villeOrigine || "",
        specialite: user.specialite || "",
        photo: user.photo || "",
      });
      setRenderKey(prev => prev + 1);
    }
  }, [user, user?.photo]);

  if (!user) {
    return (
      <div className="text-gray-600 text-center p-4">
        Chargement du profil administrateur...
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    if (onEditProfile) {
      onEditProfile();
    } else {
      setIsEditing(true);
      setError("");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nom: user.nom || "",
      email: user.email || "",
      tel: user.tel || "",
      naissance: user.naissance || "",
      ville: user.ville || "",
      villeOrigine: user.villeOrigine || "",
      specialite: user.specialite || "",
      photo: user.photo || "",
    });
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Utiliser la fonction onProfileUpdate du parent qui utilise le hook useAdminProfile
      if (onProfileUpdate) {
        await onProfileUpdate(formData);
      }

      setIsEditing(false);
      setError("");
      setRenderKey(prev => prev + 1);
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    const baseUrl = user.photo?.startsWith("avatar") 
      ? `/avatars/${user.photo}` 
      : `/storage/${user.photo}`;
    return `${baseUrl}?v=${renderKey}&t=${Date.now()}`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
      <div className="flex flex-col items-center md:w-1/4 w-full relative">
        <img
          key={`avatar-${renderKey}`}
          src={getAvatarUrl()}
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            e.target.src = "/avatars/avatar1.jpg";
          }}
        />

        {isEditing ? (
          <div className="mt-3 w-full">
            <Input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className="w-full text-sm"
              placeholder="Nom complet"
            />
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-gray-800 mt-3 text-center">
            {user.nom}
          </h2>
        )}

        <div className="mt-2 flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
                variant="outline"
              >
                <Save className="w-3 h-3 mr-1" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button 
                onClick={handleCancel} 
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <X className="w-3 h-3 mr-1" />
                Annuler
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleEdit}
              size="sm"
              variant="outline"
            >
              <Edit className="w-3 h-3 mr-1" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 w-full">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          {isEditing ? (
            <>
              <Input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="Email" 
              />
              <Input 
                name="tel" 
                type="tel" 
                value={formData.tel} 
                onChange={handleInputChange} 
                placeholder="Téléphone" 
              />
              <Input 
                name="naissance" 
                type="date" 
                value={formData.naissance} 
                onChange={handleInputChange} 
              />
              <Input 
                name="ville" 
                value={formData.ville} 
                onChange={handleInputChange} 
                placeholder="Ville actuelle" 
              />
              <Input 
                name="villeOrigine" 
                value={formData.villeOrigine} 
                onChange={handleInputChange} 
                placeholder="Ville d'origine" 
              />
              <Input 
                name="specialite" 
                value={formData.specialite} 
                onChange={handleInputChange} 
                placeholder="Spécialité" 
              />
            </>
          ) : (
            <>
              <p><strong>Email :</strong> {user.email || "Non défini"}</p>
              <p><strong>Téléphone :</strong> {user.tel || "Non défini"}</p>
              <p><strong>Date de naissance :</strong> {user.naissance || "Non définie"}</p>
              <p><strong>Ville :</strong> {user.ville || "Non définie"}</p>
              <p><strong>Ville d'origine :</strong> {user.villeOrigine || "Non définie"}</p>
              <p><strong>Spécialité :</strong> {user.specialite || "Non définie"}</p>
              <p><strong>Inscrit depuis :</strong> {user.created_at || "Non défini"}</p>
              <p><strong>Dernière connexion :</strong> {user.last_login_at || "Non définie"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard_Admin;
