import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Award,
  Clock,
  ChevronRight
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Logo et Description */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block group">
                <div className="flex items-center space-x-3 mb-6 transition-transform group-hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">EPG</div>
                    <div className="text-xs text-gray-400">École Polytechnique des Génies</div>
                  </div>
                </div>
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                Leader à Fès dans la formation professionnelle et les services informatiques. 
                Nous formons les experts de demain.
              </p>

              {/* Social Media */}
              <div className="flex space-x-3">
                <a 
                  href="https://www.facebook.com/epg.ma/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-gray-800 p-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-110"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 p-2.5 rounded-lg hover:bg-blue-400 transition-all duration-300 transform hover:scale-110"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-800 p-2.5 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/epg.ma" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-gray-800 p-2.5 rounded-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-110"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Liens Rapides */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
                Liens Rapides
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                    À propos de nous
                  </Link>
                </li>
                <li>
                  <Link to="/formationPublique" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                    Nos Formations
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                    Inscription
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                    <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                    Connexion
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
                Contact
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mt-0.5 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-gray-300 text-left">
                    <p className="font-medium text-white mb-1">Adresse</p>
                    <p>Près de la pharmacie Bahja</p>
                    <p>Avenue Mohammed 5</p>
                    <p>Au-dessus du café Mamouniya, 4ème étage</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 group">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mt-0.5 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-gray-300 text-left">
                    <p className="font-medium text-white mb-1">Téléphones</p>
                    <a href="tel:0660777382" className="block hover:text-blue-400 transition-colors">
                      Portable: 06 60 77 73 82
                    </a>
                    <a href="tel:0535000000" className="block hover:text-blue-400 transition-colors">
                      Fixe: 05 35 00 00 00
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 group">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mt-0.5 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-gray-300 text-left">
                    <p className="font-medium text-white mb-1">Email</p>
                    <a href="mailto:ae.lazrak@gmail.com" className="hover:text-blue-400 transition-colors">
                      ae.lazrak@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 relative inline-block">
                Horaires
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              </h4>
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Lundi à Vendredi</p>
                    <p className="text-blue-400 text-lg font-bold">9h00 - 21h00</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-600">
                  <p className="text-xs text-gray-400 mb-3">Support disponible</p>
                  <div className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold">
                    24/7/365
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} <span className="text-white font-semibold">École Polytechnique des Génies</span>. Tous droits réservés.
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Certifiée ISO 9001:2015
              </span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Agréée par l'État
              </span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Membre CGEM
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;