import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Calendar, GraduationCap, Building, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const avatarList = [
  "avatar1.svg", "avatar2.svg", "avatar3.svg", "avatar4.svg", "avatar5.svg", "avatar6.svg",
  "avatar7.svg", "avatar8.svg", "avatar9.svg", "avatar10.svg", "avatar11.svg", "avatar12.svg",
  "avatar13.svg", "avatar14.svg", "avatar15.svg", "avatar16.svg", "avatar17.svg", "avatar18.svg",
  "avatar19.svg", "avatar20.svg", "avatar21.svg", "avatar22.svg", "avatar23.svg", "avatar24.svg",
  "avatar25.svg",
];

const EditProfilePanel_Teacher = ({ teacher, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    tel: "",
    ville: "",
    villeOrigine: "",
    naissance: "",
    specialite: "",
    bio: "",
    experience_years: 0,
    linkedin_url: "",
    website_url: "",
    photo: avatarList[0],
  });

  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarList[0]);

  useEffect(() => {
    if (teacher) {
      const newFormData = {
        nom: teacher.nom || "",
        email: teacher.email || "",
        tel: teacher.tel || "",
        ville: teacher.ville || "",
        villeOrigine: teacher.villeOrigine || "",
        naissance: teacher.naissance || "",
        specialite: teacher.specialite || "",
        bio: teacher.bio || "",
        experience_years: teacher.experience_years || 0,
        linkedin_url: teacher.linkedin_url || "",
        website_url: teacher.website_url || "",
        photo: teacher.photo || avatarList[0],
      };
      setFormData(newFormData);
      setSelectedAvatar(teacher.photo || avatarList[0]);
    }
  }, [teacher]);

  const userId = teacher?.user_id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setFormData((prev) => ({ ...prev, photo: avatar }));
  };

  const handleSave = async () => {
    if (!userId) {
      console.error("Impossible de sauvegarder: user_id non défini");
      return;
    }

    setLoading(true);
    try {
      const formPayload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formPayload.append(key, value);
        }
      });

      formPayload.set("photo", selectedAvatar);

      await onSave(formPayload);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil formateur :", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!userId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Erreur: Données formateur incomplètes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={onClose} className="w-full">
              Fermer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Modifier le profil formateur
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Sélection d'avatar */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Choisir un avatar
            </Label>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-48 overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {avatarList.map((avatar) => (
                <div
                  key={avatar}
                  className={`cursor-pointer p-1 rounded-lg transition-all ${
                    selectedAvatar === avatar
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <img
                    src={`/avatars/${avatar}`}
                    alt={`Avatar ${avatar}`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/avatars/avatar1.svg";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Nom complet *
              </Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom complet"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@exemple.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="tel" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="tel"
                name="tel"
                type="tel"
                value={formData.tel}
                onChange={handleChange}
                placeholder="06 12 34 56 78"
              />
            </div>

            <div>
              <Label htmlFor="naissance" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                Date de naissance
              </Label>
              <Input
                id="naissance"
                name="naissance"
                type="date"
                value={formData.naissance}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="ville" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4" />
                Ville actuelle
              </Label>
              <Input
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Paris"
              />
            </div>

            <div>
              <Label htmlFor="villeOrigine" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="w-4 h-4" />
                Ville d'origine
              </Label>
              <Input
                id="villeOrigine"
                name="villeOrigine"
                value={formData.villeOrigine}
                onChange={handleChange}
                placeholder="Marseille"
              />
            </div>

            <div>
              <Label htmlFor="specialite" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <GraduationCap className="w-4 h-4" />
                Spécialité *
              </Label>
              <Input
                id="specialite"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                placeholder="Développement Web, Mathématiques..."
                required
              />
            </div>

            <div>
              <Label htmlFor="experience_years" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Users className="w-4 h-4" />
                Années d'expérience
              </Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                max="50"
                value={formData.experience_years}
                onChange={handleChange}
                placeholder="5"
              />
            </div>

            <div>
              <Label htmlFor="linkedin_url" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Globe className="w-4 h-4" />
                Profil LinkedIn
              </Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/votre-profil"
              />
            </div>

            <div>
              <Label htmlFor="website_url" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Globe className="w-4 h-4" />
                Site web personnel
              </Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://votre-site.com"
              />
            </div>
          </div>

          {/* Biographie */}
          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2 block">
              Biographie / Présentation
            </Label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Présentez-vous en quelques lignes : votre parcours, vos passions, votre approche pédagogique..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfilePanel_Teacher;
