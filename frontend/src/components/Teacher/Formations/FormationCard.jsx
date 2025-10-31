/* eslint-disable no-unused-vars */
// src/components/Teacher/Formations/FormationCard.jsx

import React, { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { BsFolder2Open } from "react-icons/bs";
import { FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import CourseListInFormation from "./CourseListInFormation";
import EditFormationPanel from "./EditFormationPanel"; // 🔹 Important : importer le panneau latéral

const FormationCard = ({ formation, onEdit, onDelete, onUpdate, availableCourses }) => {
  const [showCourses, setShowCourses] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // 🔹 État local pour le panneau

  return (
    <div className="relative bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header indigo avec titre centré */}
      <div className="bg-indigo-600 text-white py-6 px-4">
        <h3 className="text-xl font-bold text-center">{formation.title}</h3>
      </div>
      
      {/* Contenu principal */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3">{formation.description}</p>

        {/* Statistiques centrées */}
        <div className="flex justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaChalkboardTeacher className="text-indigo-500" />
            <p>{formation.courses?.length || 0} Cours</p>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-green-500" />
            <p>{formation.total_enrolled || formation.studentsCount || 0} Étudiants</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 font-medium">{formation.price}€</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${
              formation.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {formation.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-between text-sm gap-2">
          <button
            onClick={() => setShowCourses(!showCourses)}
            className="flex items-center gap-1 border border-indigo-500 hover:bg-indigo-50 text-indigo-700 px-3 py-1 rounded"
          >
            <BsFolder2Open /> Voir les cours
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditOpen(true)} // 🔹 ouvrir le panneau
              className="flex items-center gap-1 border border-yellow-500 hover:bg-yellow-50 text-yellow-700 px-3 py-1 rounded"
            >
              <FiEdit /> Modifier
            </button>
            <button
              onClick={() => onDelete(formation.id)}
              className="flex items-center gap-1 border border-red-500 hover:bg-red-50 text-red-700 px-3 py-1 rounded"
            >
              <FiTrash2 /> Supprimer
            </button>
          </div>
        </div>

        {/* Panel des cours */}
        {showCourses && (
          <div className="pt-3">
            <CourseListInFormation courses={formation.courses || []} />
          </div>
        )}
      </div>

      {/* 🔹 Panneau de modification */}
      {isEditOpen && (
        <EditFormationPanel
          formation={formation}
          onClose={() => setIsEditOpen(false)}
          onSave={(formationId, updatedData) => {
            onUpdate(formationId, updatedData);
            setIsEditOpen(false);
          }}
          availableCourses={availableCourses}
        />
      )}
    </div>
  );
};

export default FormationCard;
