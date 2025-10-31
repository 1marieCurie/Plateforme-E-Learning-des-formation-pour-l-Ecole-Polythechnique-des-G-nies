// src/components/Teacher/Chapitres/ChapterList.jsx

import React from "react";
import { FiEdit, FiTrash2, FiClock, FiVideo } from "react-icons/fi";

const ChapterList = ({ chapitres = [], onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {chapitres.map((ch, index) => (
        <div
          key={ch.id}
          className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              📘 Chapitre {index + 1} : {ch.titre}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(ch)}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
              >
                <FiEdit /> Modifier
              </button>
              <button
                onClick={() => onDelete(ch.id)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <FiTrash2 /> Supprimer
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600 space-y-1">
            
            {ch.video && (
              <p className="flex items-center gap-1">
                <FiVideo className="text-indigo-500" /> Vidéo :{" "}
                <a
                  href={ch.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  Voir
                </a>
              </p>
            )}
            {ch.description && (
              <p className="text-gray-500 italic mt-1">{ch.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChapterList;
