import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, BookOpen, Award, Phone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  SimpleDropdown, 
  DropdownMenuGrid, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Gestion d'erreur pour le contexte d'authentification
  let user = null;
  let logout = () => {};
  
  try {
    const auth = useContext(AuthContext);
    user = auth?.user;
    logout = auth?.logout || (() => {});
  } catch (error) {
    // Le contexte d'authentification n'est pas disponible
    console.warn('Contexte d\'authentification non disponible:', error);
  }

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

 

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EPG
                </div>
                <div className="text-xs text-gray-600 -mt-1">École Polytechnique</div>
              </div>
            </div>
          </Link>

          <Link to="/formationPublique">
            <span className="flex items-center text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-md transition-colors cursor-pointer">
              <BookOpen className="w-4 h-4 mr-2" />
              Formations
            </span>
          </Link>

            {/* Simple Links */}
            <Link to="/about">
              <span className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-md transition-colors cursor-pointer">
                À propos
              </span>
            </Link>

            <Link to="/contact">
              <span className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-md transition-colors flex items-center cursor-pointer">
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </span>
            </Link>
          

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              // Utilisateur connecté
              <SimpleDropdown
                align="end"
                trigger={
                  <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.nom}</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                }
              >
                <DropdownMenuItem>
                  <Link to="/dashboard" className="flex items-center w-full">
                    <Award className="w-4 h-4 mr-2" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <div className="flex items-center w-full text-red-600 hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </div>
                </DropdownMenuItem>
              </SimpleDropdown>
            ) : (
              // Utilisateur non connecté
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="py-4 space-y-2">
              {/* Formations */}
              <div className="px-4 py-2">
                <div className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Formations
                </div>
              </div>

              {/* Other Links */}
              <Link to="/about">
                <span className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                  À propos
                </span>
              </Link>
              <Link to="/actualites">
                <span className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                  Actualités
                </span>
              </Link>
              <Link to="/contact">
                <span className="block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 cursor-pointer">
                  Contact
                </span>
              </Link>

              {/* Mobile Action Buttons */}
              <div className="px-4 pt-4 space-y-2 border-t border-gray-200">
                {user ? (
                  // Utilisateur connecté - menu mobile
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Connecté en tant que {user.nom}
                    </div>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Award className="w-4 h-4 mr-2" />
                        Tableau de bord
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Mon profil
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  // Utilisateur non connecté - menu mobile
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        S'inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;