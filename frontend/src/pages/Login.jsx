import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, user, isLoggedIn } = useContext(AuthContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fonction utilitaire pour rediriger selon le rôle
  const redirectUserByRole = React.useCallback((userRole) => {
    console.log('Tentative de redirection vers:', userRole);
    switch (userRole) {
      case "super_admin":
        console.log('Redirection vers /admin/dashboard (super admin)');
        navigate("/admin/dashboard", { replace: true });
        break;
      case "admin":
        console.log('Redirection vers /admin');
        navigate("/admin", { replace: true });
        break;
      case "formateur":
        console.log('Redirection vers /teacher');
        navigate("/teacher", { replace: true });
        break;
      case "etudiant":
        console.log('Redirection vers /student');
        navigate("/student", { replace: true });
        break;
      default:
        console.log('Redirection vers /dashboard (fallback)');
        navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation basique des champs (suppression du rôle)
    if (!formData.email || !formData.password) {
      setError("L'email et le mot de passe sont requis.");
      return;
    }

    try {
      // Envoyer seulement email et password au backend
      const credentials = {
        email: formData.email,
        password: formData.password
      };
      
      console.log('Tentative de connexion avec:', credentials);
      setError(null); // Réinitialiser l'erreur
      
      const loginResult = await login(credentials);
      console.log('Résultat de la connexion:', loginResult);

      // Vérifier si on a bien reçu les données utilisateur
      if (loginResult && loginResult.user && loginResult.user.role) {
        const userRole = loginResult.user.role;
        console.log('Rôle utilisateur détecté:', userRole);
        console.log('État du contexte avant redirection:', { user, isLoggedIn });
        // La redirection sera gérée par le useEffect après mise à jour du contexte
      } else {
        console.error('Données utilisateur manquantes dans la réponse:', loginResult);
        setError("Erreur: données utilisateur incomplètes");
      }
      
    } catch (err) {
      console.error('Erreur complète de connexion:', err);
      
      // Gestion plus spécifique des erreurs
      if (err.response && err.response.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Erreur de connexion, veuillez réessayer.");
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn && user && user.role) {
      redirectUserByRole(user.role);
    }
  }, [isLoggedIn, user, redirectUserByRole]);
  
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
              Se connecter
            </h1>

            <form className="w-full mt-6" onSubmit={handleSubmit}>
              <div className="mx-auto max-w-xs space-y-4">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Adresse e-mail"
                  required
                />

                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="password"
                  placeholder="Mot de passe"
                  required
                />

                <button
                  type="submit"
                  className="mt-2 tracking-wide font-semibold bg-indigo-500 text-white w-full py-2 rounded-md hover:bg-indigo-600 transition duration-300 ease-in-out flex items-center justify-center focus:outline-none focus:shadow-outline"
                >
                  <svg
                    className="w-5 h-5 -ml-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <path d="M20 8v6M23 11h-6" />
                  </svg>
                  <span className="ml-2">Se connecter</span>
                </button>

                {error && (
                  <div className="text-red-500 text-xs mt-2 text-center p-2 bg-red-50 rounded">
                    {error}
                  </div>
                )}

                <div className="text-center mt-4 space-y-1 text-sm text-gray-600">
                  <p>
                    Vous n'avez pas de compte ?{" "}
                    <Link
                      to="/register"
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Créez-le (Étudiants seulement)
                    </Link>
                  </p>
                  <p>
                    <Link
                      to="/reset-password"
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </p>
                </div>
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
                "url('')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}