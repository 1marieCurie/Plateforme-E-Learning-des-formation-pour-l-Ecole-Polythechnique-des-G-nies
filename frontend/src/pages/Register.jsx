import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordConfirmation,
  validatePhone,
  validateCity,
  validateName,
  validateRole
} from '../utils/validation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

export default function Register() {
  const { register } = useContext(AuthContext); // ✅ Utiliser la méthode register du contexte
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    password_confirmation: "",
    tel: "",
    indicatif: "+212",
    ville: "",
    villeOrigine: false,
    naissance: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Fonction pour déterminer la route selon le rôle
  const getRouteByRole = (role) => {
    switch (role) {
      case 'etudiant':
        return '/student';
      case 'formateur':
        return '/teacher'; 
      case 'admin':
        return '/admin'; 
      default:
        return '/'; // route par défaut
    }
  };

  // Fonction de validation renforcée
  const validate = () => {
    let formErrors = {};
    
    // Validation du nom avec utilitaire
    const nomError = validateName(formData.nom);
    if (nomError) formErrors.nom = nomError;
    
    // Validation de l'email avec utilitaire
    const emailError = validateEmail(formData.email);
    if (emailError) formErrors.email = emailError;
    
    // Validation du mot de passe avec utilitaire
    const passwordError = validatePassword(formData.password);
    if (passwordError) formErrors.password = passwordError;
    
    // Validation de la confirmation du mot de passe
    const confirmationError = validatePasswordConfirmation(formData.password, formData.password_confirmation);
    if (confirmationError) formErrors.password_confirmation = confirmationError;
    
    // Validation du téléphone avec utilitaire
    const phoneError = validatePhone(formData.tel);
    if (phoneError) formErrors.tel = phoneError;
    
    // Validation de la ville avec utilitaire
    const cityError = validateCity(formData.ville);
    if (cityError) formErrors.ville = cityError;
    
    // Validation du rôle avec utilitaire
    const roleError = validateRole(formData.role);
    if (roleError) formErrors.role = roleError;

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Fonction asynchrone pour soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des données avant l'envoi
    if (!validate()) {
      return;
    }

    const userData = {
      nom: formData.nom,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      tel: formData.tel,
      indicatif: formData.indicatif,
      ville: formData.ville,
      villeOrigine: formData.villeOrigine,
      naissance: formData.naissance,
      role: formData.role,
    };

    try {
      // ✅ Utiliser la méthode register du contexte d'auth
      const response = await register(userData);
      console.log("Réponse de l'API:", response);
      
      // Redirection selon le rôle de l'utilisateur connecté
      const redirectRoute = getRouteByRole(response.user.role);
      navigate(redirectRoute);
      
    } catch (error) {
      if (error.response) {
        // Erreurs retournées par le backend Laravel
        console.error("Erreur API:", error.response.data);
        setErrors(error.response.data.errors || {});
        
        // Affichage d'un message d'erreur plus informatif
        const errorMessage = error.response.data.message || "Une erreur est survenue";
        alert("Erreur : " + errorMessage);
      } else {
        // Problème réseau ou autre
        console.error("Erreur réseau:", error.message);
        alert("Erreur réseau : " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center items-center py-20">
      <div className="max-w-3xl m-2 sm:m-6 bg-white shadow sm:rounded-lg flex justify-center flex-1 my-8">
        <div className="lg:w-1/2 xl:w-2/5 p-4 sm:p-8">
          <div>
            <img
              src="../../public/logo.jpg"
              className="w-24 mx-auto"
              alt="Logo"
            />
          </div>

          <div className="mt-8 flex flex-col items-center">
            <h1 className="text-xl xl:text-2xl font-extrabold">
              Créer un compte
            </h1>

            <form className="w-full mt-6" onSubmit={handleSubmit}>
              <div className="mx-auto max-w-xs space-y-4">
                <input
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="text"
                  placeholder="Nom complet"
                />
                {errors.nom && <p className="text-red-500 text-xs">{errors.nom}</p>}

                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Adresse e-mail"
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Mot de passe"
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                
                {/* Indicateur de force du mot de passe */}
                <PasswordStrengthIndicator password={formData.password} />

                <input
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Confirmer le mot de passe"
                />
                {errors.password_confirmation && <p className="text-red-500 text-xs">{errors.password_confirmation}</p>}

                {/* Téléphone + Indicatif pays */}
                <div className="flex space-x-2">
                  <div className="w-1/3">
                    <select
                      name="indicatif"
                      value={formData.indicatif}
                      onChange={handleChange}
                      className="w-full px-2 py-2 rounded-md bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    >
                      <option value="+212">🇲🇦 +212</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+1">🇺🇸 +1</option>
                    </select>
                  </div>
                  <input
                    name="tel"
                    value={formData.tel}
                    onChange={handleChange}
                    className="w-2/3 px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="tel"
                    placeholder="Numéro de téléphone"
                  />
                </div>
                {errors.tel && <p className="text-red-500 text-xs">{errors.tel}</p>}

                <input
                  name="naissance"
                  value={formData.naissance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="date"
                />

                {/* Ville + Ville d'origine */}
                <div className="flex space-x-2">
                  <input
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    className="w-1/2 px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="text"
                    placeholder="Ville"
                  />
                  
                  <select
                    name="villeOrigine"
                    value={formData.villeOrigine ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        villeOrigine: e.target.value === "true",
                      })
                    }
                    className="w-1/2 px-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-sm text-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white"
                  >
                    <option value="" disabled>
                      Ville d'origine
                    </option>
                    <option value="true" className="text-black">
                      Oui
                    </option>
                    <option value="false" className="text-black">
                      Non
                    </option>
                  </select>
                </div>
                {errors.ville && <p className="text-red-500 text-xs">{errors.ville}</p>}

                {/* Rôle */}
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                >
                  <option value="" disabled>
                    Sélectionner un rôle
                  </option>
                  <option value="etudiant">Étudiant</option>
                  <option value="formateur">Formateur</option>
                  {/* Admin retiré pour sécurité - créé uniquement par d'autres admins */}
                </select>
                {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}

                <button
                  type="submit"
                  className="mt-2 tracking-wide font-semibold bg-indigo-500 text-white w-full py-2 rounded-md hover:bg-indigo-600 transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:shadow-outline"
                >
                  <span className="ml-2">S'inscrire</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Image réduite et centrée */}
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex items-center justify-center">
          <div
            className="w-64 h-64 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}