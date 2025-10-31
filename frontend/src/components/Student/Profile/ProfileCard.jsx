import React, { useState } from "react";
import { FaPen, FaSave, FaTimes } from "react-icons/fa";
import axiosInstance from "../../../api/axios";

const ProfileCard = ({ student, onEditProfile, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: student.nom || "",
    email: student.email || "",
    tel: student.tel || "",
    naissance: student.naissance || "",
    ville: student.ville || "",
    villeOrigine: student.villeOrigine || "",
    specialite: student.specialite || "",
    photo: student.photo || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      nom: student.nom || "",
      email: student.email || "",
      tel: student.tel || "",
      naissance: student.naissance || "",
      ville: student.ville || "",
      villeOrigine: student.villeOrigine || "",
      specialite: student.specialite || "",
      photo: student.photo || "",
    });
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
        const formDataToSend = new FormData();
        // Ajouter les champs dans FormData
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                formDataToSend.append(key, formData[key]);
            }
        });

        let response;
        if (student.user_id) {
            response = await axiosInstance.put(`/student-profiles/${student.user_id}`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        } else {
            response = await axiosInstance.post('/student-profiles', formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        }

        if (onProfileUpdate) {
            onProfileUpdate(response.data);
        }

        setIsEditing(false);
        console.log("Profil mis à jour avec succès");
    } catch (err) {
        console.error("Erreur lors de la sauvegarde :", err);
        setError(
            err.response?.data?.message || "Une erreur est survenue lors de la sauvegarde"
        );
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6 w-full">
      
      <div className="flex flex-col items-center md:w-1/4 w-full relative">
        <div className="relative group">
          <img
            src={
              student.photo?.startsWith("avatar")
                ? `/avatars/${student.photo}` // depuis public/avatars
                : `/storage/${student.photo}` // depuis storage (upload)
            }
            alt="avatar"
            className="w-20 h-20 rounded-full"
          />
        </div>

        {isEditing ? (
          <div className="mt-3 w-full">
            <div className="mb-2">
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nom complet"
              />
            </div>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-gray-800 mt-3 text-center">
            {student.nom}
          </h2>
        )}

        <div className="mt-2 flex gap-2">
          {isEditing ? (
            <>
              <button
                className="flex items-center gap-2 text-green-600 border border-green-600 px-4 py-1.5 rounded hover:bg-green-50 text-sm transition disabled:opacity-50"
                onClick={handleSave}
                disabled={loading}
              >
                <FaSave className="text-xs" />
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
              <button
                className="flex items-center gap-2 text-gray-600 border border-gray-600 px-4 py-1.5 rounded hover:bg-gray-50 text-sm transition disabled:opacity-50"
                onClick={handleCancel}
                disabled={loading}
              >
                <FaTimes className="text-xs" />
                Annuler
              </button>
            </>
          ) : (
            <button
              className="flex items-center gap-2 text-indigo-600 border border-indigo-600 px-4 py-1.5 rounded hover:bg-indigo-50 text-sm transition"
              onClick={handleEdit}
            >
              <FaPen className="text-xs" />
              Modifier
            </button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email :</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone :</label>
                <input
                  type="tel"
                  name="tel"
                  value={formData.tel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: +212 600 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance :</label>
                <input
                  type="date"
                  name="naissance"
                  value={formData.naissance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville :</label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ville actuelle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville d'origine :</label>
                <input
                  type="text"
                  name="villeOrigine"
                  value={formData.villeOrigine}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ville d'origine"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité :</label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Spécialité d'étude"
                />
              </div>
            </>
          ) : (
            <>
              <p><strong>Email :</strong> {student.email || "Non défini"}</p>
              <p><strong>Téléphone :</strong> {student.tel || "Non défini"}</p>
              <p><strong>Date de naissance :</strong> {student.naissance || "Non définie"}</p>
              <p><strong>Ville :</strong> {student.ville || "Non définie"}</p>
              <p><strong>Ville d'origine :</strong> {student.villeOrigine || "Non définie"}</p>
              <p><strong>Spécialité :</strong> {student.specialite || "Non définie"}</p>
              <p><strong>Inscrit depuis :</strong> {student.created_at || "Non défini"}</p>
              <p><strong>Dernière connexion :</strong> {student.last_login_at || "Non définie"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;