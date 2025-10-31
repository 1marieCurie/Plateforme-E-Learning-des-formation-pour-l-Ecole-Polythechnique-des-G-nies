// DropdownChapitres.jsx
import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";

const DropdownChapitres = ({ coursId, chapitres = [] }) => {
  // Log chapitres reçus à chaque rendu
  console.log('DropdownChapitres - chapitres reçus:', chapitres);
  const [items, setItems] = useState(Array.isArray(chapitres) ? chapitres : []);

  // Synchroniser les chapitres reçus en props à chaque ouverture
  React.useEffect(() => {
    setItems(Array.isArray(chapitres) ? chapitres : []);
  }, [chapitres]);

  const handleDrag = (fromIdx, toIdx) => {
    const updated = [...items];
    const [dragged] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, dragged);
    setItems(updated);
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-md mt-4 px-4 py-3 shadow space-y-2">
      <h4 className="text-sm font-semibold text-indigo-600 mb-2">Chapitres (glisser pour réordonner)</h4>

      {!Array.isArray(items) ? (
        <div className="text-center text-gray-400 py-4">
          <span>Chargement des chapitres...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-400 py-4">
          <span>Aucun chapitre pour ce cours</span>
        </div>
      ) : (
        <>
          {items.slice(0, 4).map((ch, idx) => (
            <div
              key={ch.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-700 border-b pb-2 last:border-b-0 cursor-move gap-1"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const from = parseInt(e.dataTransfer.getData("text/plain"));
                handleDrag(from, idx);
              }}
            >
              <div className="flex flex-col">
                <span>📘 {ch.titre || ch.title || `Chapitre ${idx + 1}`}</span>
                {ch.description && (
                  <span className="text-xs text-gray-500 italic">{ch.description}</span>
                )}
                {ch.video && (
                  <span className="text-xs text-blue-500">Vidéo : <a href={ch.video} target="_blank" rel="noopener noreferrer" className="underline">Voir</a></span>
                )}
              </div>
              <span className="text-gray-400">{ch.duree || ch.duration_minutes ? `${ch.duree || ch.duration_minutes} min` : ""}</span>
            </div>
          ))}

          {items.length > 4 && (
            <p className="text-xs italic text-gray-400">...et d'autres chapitres</p>
          )}
        </>
      )}

      <div className="text-right pt-2">
        <Link
          to={`/teacher/chapitres?course=${coursId}`}
          className="text-indigo-600 hover:underline text-sm"
        >
          Voir tous les chapitres →
        </Link>
      </div>
    </div>
  );
};

export default DropdownChapitres;
