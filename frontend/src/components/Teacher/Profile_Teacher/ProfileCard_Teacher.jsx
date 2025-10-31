import { useState, useEffect } from "react";
import { Edit, Save, X, Star, Users, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ProfileCard_Teacher = ({ user, onEditProfile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    tel: "",
    naissance: "",
    ville: "",
    villeOrigine: "",
    specialite: "",
    bio: "",
    experience_years: 0,
    linkedin_url: "",
    website_url: "",
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
        bio: user.bio || "",
        experience_years: user.experience_years || 0,
        linkedin_url: user.linkedin_url || "",
        website_url: user.website_url || "",
        photo: user.photo || "",
      });
      setRenderKey(prev => prev + 1);
    }
  }, [user, user?.photo]);

  if (!user) {
    return (
      <div className="text-gray-600 text-center p-4">
        Chargement du profil formateur...
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
      bio: user.bio || "",
      experience_years: user.experience_years || 0,
      linkedin_url: user.linkedin_url || "",
      website_url: user.website_url || "",
      photo: user.photo || "",
    });
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Utiliser la fonction onProfileUpdate du parent qui utilise le hook useTeacherProfile
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
    <div className="bg-white shadow rounded-lg p-6">
      {/* En-tête avec avatar et informations principales */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
        <div className="flex flex-col items-center md:w-1/4 w-full relative">
          <img
            key={`avatar-${renderKey}`}
            src={getAvatarUrl()}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              e.target.src = "/avatars/avatar1.svg";
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

          {/* Badge de vérification */}
          {user.is_verified && (
            <div className="flex items-center mt-2 text-green-600">
              <Award className="w-4 h-4 mr-1" />
              <span className="text-sm">Vérifié</span>
            </div>
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

        {/* Statistiques du formateur */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <div className="text-lg font-semibold text-blue-600">{user.total_students || 0}</div>
              <div className="text-sm text-gray-600">Étudiants</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="text-lg font-semibold text-green-600">{user.total_courses || 0}</div>
              <div className="text-sm text-gray-600">Cours</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
              <div className="text-lg font-semibold text-yellow-600">{user.average_rating || 0.0}</div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Informations personnelles */}
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
            <Input 
              name="experience_years" 
              type="number" 
              value={formData.experience_years} 
              onChange={handleInputChange} 
              placeholder="Années d'expérience" 
              min="0"
              max="50"
            />
            <Input 
              name="linkedin_url" 
              value={formData.linkedin_url} 
              onChange={handleInputChange} 
              placeholder="Profil LinkedIn" 
            />
            <Input 
              name="website_url" 
              value={formData.website_url} 
              onChange={handleInputChange} 
              placeholder="Site web personnel" 
            />
            <div className="md:col-span-2">
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Biographie/Présentation"
                rows="3"
                className="w-full p-2 border rounded-md resize-none"
              />
            </div>
          </>
        ) : (
          <>
            <p><strong>Email :</strong> {user.email || "Non défini"}</p>
            <p><strong>Téléphone :</strong> {user.tel || "Non défini"}</p>
            <p><strong>Date de naissance :</strong> {user.naissance || "Non définie"}</p>
            <p><strong>Ville :</strong> {user.ville || "Non définie"}</p>
            <p><strong>Ville d'origine :</strong> {user.villeOrigine || "Non définie"}</p>
            <p><strong>Spécialité :</strong> {user.specialite || "Non définie"}</p>
            <p><strong>Expérience :</strong> {user.experience_years || 0} années</p>
            <p><strong>LinkedIn :</strong> {user.linkedin_url ? <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voir profil</a> : "Non défini"}</p>
            <p><strong>Site web :</strong> {user.website_url ? <a href={user.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visiter</a> : "Non défini"}</p>
            <div className="md:col-span-2">
              <p><strong>Biographie :</strong></p>
              <p className="text-gray-600 mt-1">{user.bio || "Aucune biographie renseignée"}</p>
            </div>
            <p><strong>Inscrit depuis :</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Non défini"}</p>
            <p><strong>Dernière connexion :</strong> {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Non définie"}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCard_Teacher;
