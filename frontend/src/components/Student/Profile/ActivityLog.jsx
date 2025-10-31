import React from "react";
import {
  FaSignInAlt,
  FaBookOpen,
  FaUserEdit,
  FaCheckCircle,
  FaCreditCard,
} from "react-icons/fa";

const iconMap = {
  Connexion: <FaSignInAlt className="text-indigo-600 text-xl" />,
  "Cours consulté": <FaBookOpen className="text-blue-600 text-xl" />,
  "Modification profil": <FaUserEdit className="text-green-600 text-xl" />,
  "Progression enregistrée": <FaCheckCircle className="text-purple-600 text-xl" />,
  "Dernier paiement": <FaCreditCard className="text-yellow-600 text-xl" />,
};

const ActivityLog = ({ logs }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6 w-2/3">
      {/* Titre centré */}
      <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
        Historique des actions
      </h3>

      {/* Liste des logs */}
      <ul className="space-y-4">
        {logs.map((log) => (
          <li key={log.id} className="flex w-full items-start">
            {/* Colonne 1 : Icône alignée avec l’intitulé */}
            <div className="w-[10%] flex justify-center pt-[3px]">
              {/* pt-[3px] aligne verticalement l'icône avec le log.type */}
              {iconMap[log.type] || (
                <FaCheckCircle className="text-gray-500 text-xl" />
              )}
            </div>

            {/* Espacement - 2% */}
            <div className="w-[2%]"></div>

            {/* Colonne 2 : Texte à gauche */}
            <div className="w-[88%] text-left text-sm text-gray-700">
              <p className="font-medium leading-tight">{log.type}</p>
              <p className="leading-tight">{log.description}</p>
              <p className="text-xs text-gray-500">{log.timestamp}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
