/* eslint-disable no-unused-vars */
// src/components/Teacher/MesCours/AddCourseDropdown.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus } from "react-icons/fi";

const AddCourseDropdown = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && description && file) {
      onSubmit({ title, description, file });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-10 mt-2 right-0 w-full sm:w-[400px] bg-white rounded shadow-lg p-4 border border-indigo-100"
      >
        {/* En-tête */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Ajouter un cours</h2>
          <button onClick={onClose}>
            <FiX className="text-gray-500 hover:text-red-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Titre */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du cours (ex: React avancé)"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />

          {/* Champ Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du cours (ex: Ce cours vous apprendra à créer des applications modernes avec React...)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />

          {/* Champ Fichier stylisé */}
          <div className="relative border border-indigo-300 rounded px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-indigo-50 transition">
            <FiPlus className="text-indigo-500 text-lg" />
            <label
              htmlFor="course-file"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Choisir un fichier (image du cours)
            </label>
            <input
              id="course-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
              required
            />
          </div>

          {/* Bouton Ajouter */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Ajouter
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddCourseDropdown;
