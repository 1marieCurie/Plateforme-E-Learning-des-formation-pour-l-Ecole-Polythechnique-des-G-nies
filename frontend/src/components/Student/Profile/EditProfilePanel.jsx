import React, { useState } from "react";
import { X, User, Mail, Phone, MapPin, Calendar, GraduationCap, Building } from "lucide-react";

const avatarList = [
  "avatar1.svg","avatar2.svg","avatar3.svg","avatar4.svg","avatar5.svg","avatar6.svg",
  "avatar7.svg","avatar8.svg","avatar9.svg","avatar10.svg","avatar11.svg","avatar12.svg",
  "avatar13.svg","avatar14.svg","avatar15.svg","avatar16.svg","avatar17.svg","avatar18.svg",
  "avatar19.svg","avatar20.svg","avatar21.svg","avatar22.svg","avatar23.svg","avatar24.svg",
  "avatar25.svg",
];

const EditProfilePanel = ({ student, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: student?.nom || "",
    email: student?.email || "",
    tel: student?.tel || "",
    ville: student?.ville || "",
    villeOrigine: student?.villeOrigine || "",
    naissance: student?.naissance || "",
    specialite: student?.specialite || "",
    photo: student?.photo || "", // avatar sélectionné
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatar) => {
    setFormData((prev) => ({ ...prev, photo: avatar }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg w-[700px] max-h-[95vh] overflow-y-auto relative border-2 border-blue-400">
        <button className="absolute top-4 right-4" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Modifier Profil</h2>

        {/* Form fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InputField 
            icon={<User className="w-4 h-4" />} 
            name="nom" 
            value={formData.nom} 
            onChange={handleChange}
            placeholder="Nom complet" 
          />
          <InputField 
            icon={<Mail className="w-4 h-4" />} 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange}
            placeholder="Email" 
          />
          <InputField 
            icon={<Phone className="w-4 h-4" />} 
            name="tel" 
            type="tel"
            value={formData.tel} 
            onChange={handleChange}
            placeholder="Téléphone" 
          />
          <InputField 
            icon={<MapPin className="w-4 h-4" />} 
            name="ville" 
            value={formData.ville} 
            onChange={handleChange}
            placeholder="Ville actuelle" 
          />
          <InputField 
            icon={<Building className="w-4 h-4" />} 
            name="villeOrigine" 
            value={formData.villeOrigine} 
            onChange={handleChange}
            placeholder="Ville d'origine" 
          />
          <InputField 
            icon={<Calendar className="w-4 h-4" />} 
            name="naissance" 
            type="date"
            value={formData.naissance} 
            onChange={handleChange}
            placeholder="Date de naissance" 
          />
        </div>

        {/* Spécialité sur toute la largeur */}
        <div className="mb-6">
          <InputField 
            icon={<GraduationCap className="w-4 h-4" />} 
            name="specialite" 
            value={formData.specialite} 
            onChange={handleChange}
            placeholder="Spécialité d'étude"
            fullWidth={true}
          />
        </div>

        {/* Sélection d'avatar */}
        <div className="mb-6">
          <p className="font-medium mb-3">Choisis un avatar :</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {avatarList.map((avatar) => (
              <img
                key={avatar}
                src={`/avatars/${avatar}`}
                alt={avatar}
                className={`w-16 h-16 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                  formData.photo === avatar ? "border-blue-500 scale-110" : "border-gray-300"
                }`}
                onClick={() => handleAvatarSelect(avatar)}
              />
            ))}
          </div>
          {formData.photo && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">Avatar sélectionné : {formData.photo}</p>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant réutilisable pour les champs
const InputField = ({ icon, name, value, onChange, type = "text", placeholder, fullWidth = false }) => (
  <div className={`${fullWidth ? 'col-span-2' : ''}`}>
    <div className="flex items-center border rounded px-3 py-2 focus-within:border-blue-500 transition-colors">
      <span className="text-gray-400 mr-2">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="outline-none flex-grow"
      />
    </div>
  </div>
);

export default EditProfilePanel;