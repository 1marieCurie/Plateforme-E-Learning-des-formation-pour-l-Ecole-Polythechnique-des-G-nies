// src/components/Contact/DirectorCard.jsx
import React from 'react';
import { Mail, Phone, MapPin, Linkedin, User } from 'lucide-react';

const DirectorCard = ({ 
  name = "M. Lazrak", 
  title = "Directeur Général", 
  email = "ae.lazrak@gmail.com",
  phone = "06 60 77 73 82",
  description = "Leader visionnaire avec plus de 15 ans d'expérience dans l'éducation technologique et la formation professionnelle.",
  linkedinUrl = "https://www.linkedin.com/in/alaeeddine-lazrak-09463065/",
  imageUrl = "/Lazrak.jpg"
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Notre Directeur
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Photo du directeur */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg ring-4 ring-blue-100">
            <img
              src={imageUrl}
              alt={`${name} - ${title}`}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '55% center' }}
              onError={(e) => {
                // Fallback si l'image n'existe pas
                e.target.src = "/images/Lazrak.png";
                e.target.onerror = () => {
                  // Si PNG n'existe pas non plus, utiliser un avatar par défaut
                  e.target.src = "/avatars/avatar1.svg";
                };
              }}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Informations du directeur */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
          <p className="text-lg text-blue-600 font-semibold">{title}</p>
          <p className="text-gray-600 max-w-md">
            {description}
          </p>
        </div>

        {/* Coordonnées */}
        <div className="w-full space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Mail className="w-5 h-5 text-blue-600" />
            <a href={`mailto:${email}`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {email}
            </a>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Phone className="w-5 h-5 text-blue-600" />
            <a href={`tel:${phone}`} className="text-gray-700 hover:text-blue-600 transition-colors">
              {phone}
            </a>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">École Polytechnique des Génies, Fès</span>
          </div>
        </div>

        {/* LinkedIn */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-[#0077B5] hover:bg-[#005885] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Linkedin className="w-5 h-5" />
          <span>Suivre sur LinkedIn</span>
        </a>
      </div>
    </div>
  );
};

export default DirectorCard;
