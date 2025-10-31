// src/components/Contact/ContactDetails.jsx
import React from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const ContactDetails_Div = () => {
  const contactDetails = [
    {
      icon: Phone,
      title: 'Téléphone Principal',
      value: '06 60 77 73 82',
      link: 'tel:0660777382'
    },
    {
      icon: Phone,
      title: 'Téléphone Secondaire',
      value: '06 19 08 66 66',
      link: 'tel:0619086666'
    },
    {
      icon: Mail,
      title: 'Email Principal',
      value: 'ae.lazrak@gmail.com',
      link: 'mailto:ae.lazrak@gmail.com'
    },
    {
      icon: Mail,
      title: 'Email Général',
      value: 'contact@epg.ma',
      link: 'mailto:contact@epg.ma'
    }
  ];

  const workingHours = [
    { day: 'Lundi - Vendredi', hours: '8h00 - 18h00' },
    { day: 'Samedi', hours: '9h00 - 13h00' },
    { day: 'Dimanche', hours: 'Fermé' }
  ];

  return (
    <div className="space-y-12 mt-16">
      {/* Container avec fond indigo pour les deux cartes - Pleine largeur */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 shadow-2xl w-full max-w-none">
        <div className="grid lg:grid-cols-2 gap-8 w-full">
          {/* Carte Informations générales - Gauche */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 w-full">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Informations Générales</h3>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </div>
            <div className="space-y-6">
              {contactDetails.map((detail, index) => {
                const IconComponent = detail.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-3 shadow-lg">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg mb-1">{detail.title}</p>
                      {detail.link ? (
                        <a 
                          href={detail.link}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="text-gray-600 text-base">{detail.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carte Horaires d'ouverture - Droite */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 w-full">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-8 h-8 text-indigo-600" />
                <h3 className="text-3xl font-bold text-gray-900">Horaires d'ouverture</h3>
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              {workingHours.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 shadow-sm">
                  <span className="font-semibold text-gray-800 text-lg">{schedule.day}</span>
                  <span className={`font-bold text-lg px-3 py-1 rounded-lg ${
                    schedule.hours === 'Fermé' 
                      ? 'text-red-600 bg-red-100' 
                      : 'text-indigo-600 bg-indigo-100'
                  }`}>
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-l-4 border-indigo-500 shadow-sm">
              <p className="text-indigo-800 text-base leading-relaxed">
                <strong className="text-indigo-900">💡 Note importante :</strong><br/>
                Notre équipe reste disponible par email 24h/24 et 7j/7 pour répondre à toutes vos questions urgentes et vous accompagner dans vos démarches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Localisation - En dessous, centrée */}
      <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 text-blue-600 mb-4">
              <MapPin className="w-8 h-8" />
              <h3 className="text-3xl font-bold text-gray-900">Notre Localisation</h3>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto"></div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-2xl p-8 max-w-3xl mx-auto shadow-lg">
            <p className="text-2xl font-bold text-gray-900 mb-3">
              École Polytechnique des Génies
            </p>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              123 Rue de l'Innovation<br/>
              30000 Fès, Maroc
            </p>
            <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-2xl mx-auto">
              Située au cœur de Fès, notre école bénéficie d'un emplacement stratégique, facilement accessible par tous les moyens de transport en commun. Un environnement d'apprentissage moderne au service de votre réussite.
            </p>
            <a
              href="https://maps.google.com/?q=Fès,Morocco"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-6 h-6" />
              <span>📍 Voir sur Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails_Div;
