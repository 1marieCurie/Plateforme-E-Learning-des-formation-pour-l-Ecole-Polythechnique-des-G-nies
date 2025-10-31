/* eslint-disable no-unused-vars */
// src/components/Teacher/MesCours/CourseCard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2, FiUploadCloud, FiBook } from "react-icons/fi";
import { BsListTask } from "react-icons/bs";
import { MdOutlineQuiz } from "react-icons/md";

import DropdownChapitres from "./DropdownChapitres";
import StudentDropdown from "./StudentDropdown";

const CourseCard = ({ course, chapitres = [], onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [showChapitres, setShowChapitres] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [forceDeleteLoading, setForceDeleteLoading] = useState(false);

  useEffect(() => {
    if (course) {
      setNewTitle(course.title || "");
      setNewDesc(course.description || "");
    }
  }, [course]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || (!newFile && !newDesc)) return;

    onUpdate?.({
      ...course,
      title: newTitle,
      description: newDesc,
      file: newFile,
    });

    setIsEditing(false);
  };

  // Fonction pour obtenir une couleur d'arrière-plan basée sur le titre du cours
  const getCourseColor = (title) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500'
    ];
    const index = title ? title.length % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200 w-full max-w-4xl mx-auto">
      <div className="flex">
        {/* Section image/icône */}
        <div className="w-48 h-48 flex items-center justify-center p-2">
          {course.image ? (
            <img
              src={course.image}
              alt={course.title}
              className="object-cover w-full h-full rounded-lg"
            />
          ) : (
            <div className={`w-full h-full rounded-lg ${getCourseColor(course.title)} flex items-center justify-center`}>
              <div className="text-center text-white">
                <FiBook className="w-12 h-12 mx-auto mb-2" />
                <div className="text-sm font-medium px-2">
                  {course.title?.substring(0, 20)}
                  {course.title?.length > 20 && '...'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
            
            {/* Description si disponible */}
            {course.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {course.description}
              </p>
            )}
            
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex flex-row items-center justify-center gap-6">
                <span className="flex items-center gap-2">
                  <FiBook className="text-indigo-600" /> {course.students || 0} étudiants
                </span>
                <span className="flex items-center gap-2">
                  <BsListTask className="text-blue-600" /> Progression moyenne : {course.avgProgress || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex flex-wrap gap-3 justify-center items-center w-full">
              <button
                onClick={() => {
                  setIsEditing((prev) => !prev);
                  setShowChapitres(false);
                }}
                className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded text-sm transition-colors"
              >
                <FiEdit /> Modifier
              </button>

              <button
                onClick={() => {
                  setShowChapitres((prev) => !prev);
                  setIsEditing(false);
                }}
                className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm transition-colors"
              >
                <BsListTask /> Chapitres
              </button>

              <button
                onClick={() => {
                  if (course.students && course.students > 0) {
                    setShowWarningModal(true);
                  } else {
                    setShowDeleteModal(true);
                  }
                }}
                className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm transition-colors"
              >
                <FiTrash2 /> Supprimer
              </button>
      {/* Modal d'avertissement si étudiants inscrits */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm animate-modal-open relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl focus:outline-none"
              onClick={() => setShowWarningModal(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <h4 className="text-lg font-semibold text-red-700 mb-4">Attention : étudiants inscrits</h4>
            <p className="text-gray-700 mb-6">Ce cours a <span className="font-bold">{course.students}</span> étudiant(s) inscrit(s). Voulez-vous vraiment procéder à la suppression ? Cette action supprimera le cours et toutes ses données, même pour les étudiants inscrits.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                onClick={() => setShowWarningModal(false)}
                disabled={forceDeleteLoading}
              >
                Annuler
              </button>
              <button
                className={`px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm ${forceDeleteLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={async () => {
                  setForceDeleteLoading(true);
                  await onDelete(course.id, true); // true = suppression forcée
                  setForceDeleteLoading(false);
                  setShowWarningModal(false);
                }}
                disabled={forceDeleteLoading}
              >
                Oui, supprimer malgré tout
              </button>
            </div>
          </div>
          <style>{`
            @keyframes modalOpen {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-modal-open {
              animation: modalOpen 0.25s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </div>
      )}
      {/* Modal de confirmation suppression */}
      {showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm animate-modal-open relative">
            {/* Bouton de fermeture (croix) */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl focus:outline-none"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Confirmer la suppression</h4>
            <p className="text-gray-700 mb-6">Voulez-vous vraiment supprimer le cours <span className="font-bold">{course.title}</span> ? Cette action est irréversible.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete(course.id);
                }}
              >
                Oui, supprimer
              </button>
            </div>
          </div>
          {/* Animation CSS */}
          <style>{`
            @keyframes modalOpen {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-modal-open {
              animation: modalOpen 0.25s cubic-bezier(0.4,0,0.2,1);
            }
          `}</style>
        </div>
      )}
            </div>
          </div>
        </div>
      </div>

      {/* Section d'édition */}
      {isEditing && (
        <form
          onSubmit={handleEditSubmit}
          className="bg-indigo-50 px-6 py-4 border-t border-indigo-200 space-y-3"
        >
          <h4 className="text-md font-semibold text-indigo-800">Modifier le cours</h4>

          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titre du cours"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description..."
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          />

          <label className="flex items-center gap-2 border border-indigo-300 rounded px-3 py-2 cursor-pointer bg-white hover:bg-indigo-50 transition">
            <FiUploadCloud className="text-indigo-500 text-lg" />
            <span className="text-sm text-gray-600">
              Ajouter/Remplacer l'image du cours (optionnel)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          {newFile && (
            <div className="flex items-center gap-2 bg-white p-2 rounded border">
              <span className="text-indigo-600">📷</span>
              <p className="text-sm text-indigo-600 font-medium">{newFile.name}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Section chapitres */}
      {showChapitres && (
        <DropdownChapitres
          coursId={course.id}
          chapitres={chapitres}
        />
      )}
    </div>
  );
};

export default CourseCard;