import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Calendar, GraduationCap, Building } from "lucide-react";
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

const EditProfilePanel = ({ admin, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    tel: "",
    ville: "",
    villeOrigine: "",
    naissance: "",
    specialite: "",
    photo: avatarList[0],
  });

  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarList[0]);

  useEffect(() => {
    if (admin) {
      const newFormData = {
        nom: admin.nom || "",
        email: admin.email || "",
        tel: admin.tel || "",
        ville: admin.ville || "",
        villeOrigine: admin.villeOrigine || "",
        naissance: admin.naissance || "",
        specialite: admin.specialite || "",
        photo: admin.photo || avatarList[0],
      };
      setFormData(newFormData);
      setSelectedAvatar(admin.photo || avatarList[0]);
    }
  }, [admin]);

  const userId = admin?.user_id;

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
      console.error("Erreur lors de la mise à jour du profil admin :", error);
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
              Erreur: Données administrateur incomplètes
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
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Modifier Profil Administrateur</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Avatar */}
          <div className="text-center">
            <div className="mb-4">
              <img
                src={`/avatars/${selectedAvatar}`}
                alt="Avatar sélectionné"
                className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-200"
              />
            </div>

            <Label className="text-sm font-medium mb-3 block">Choisir un avatar :</Label>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
              {avatarList.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handleAvatarSelect(avatar)}
                  className="relative transition-all hover:scale-110 focus:outline-none"
                  style={{ border: "none", background: "none", padding: 0 }}
                >
                  <img
                    src={`/avatars/${avatar}`}
                    alt={`Avatar ${avatar}`}
                    className={`w-12 h-12 rounded-full object-cover border-2 ${
                      selectedAvatar === avatar
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    style={{
                      boxSizing: "border-box",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              icon={<User className="w-4 h-4" />}
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom complet"
              label="Nom complet"
            />
            <InputField
              icon={<Mail className="w-4 h-4" />}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              label="Email"
            />
            <InputField
              icon={<Phone className="w-4 h-4" />}
              name="tel"
              type="tel"
              value={formData.tel}
              onChange={handleChange}
              placeholder="Téléphone"
              label="Téléphone"
            />
            <InputField
              icon={<MapPin className="w-4 h-4" />}
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              placeholder="Ville actuelle"
              label="Ville actuelle"
            />
            <InputField
              icon={<Building className="w-4 h-4" />}
              name="villeOrigine"
              value={formData.villeOrigine}
              onChange={handleChange}
              placeholder="Ville d'origine"
              label="Ville d'origine"
            />
            <InputField
              icon={<Calendar className="w-4 h-4" />}
              name="naissance"
              type="date"
              value={formData.naissance}
              onChange={handleChange}
              placeholder="Date de naissance"
              label="Date de naissance"
            />
          </div>

          <div>
            <InputField
              icon={<GraduationCap className="w-4 h-4" />}
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              placeholder="Spécialité"
              label="Spécialité"
              fullWidth={true}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InputField = ({
  icon,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  label,
  fullWidth = false,
}) => (
  <div className={`space-y-2 ${fullWidth ? "md:col-span-2" : ""}`}>
    <Label htmlFor={name} className="text-sm font-medium">
      {label}
    </Label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <Input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  </div>
);

export default EditProfilePanel;
