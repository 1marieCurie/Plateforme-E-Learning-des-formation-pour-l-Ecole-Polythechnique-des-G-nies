/* eslint-disable no-unused-vars */
// src/components/Teacher/Formations/FormationForm.jsx

import React, { useState, useEffect } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { BsPlusCircle } from "react-icons/bs";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const FormationForm = ({ courses, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    duration_hours: '',
    difficulty_level: 'debutant'
  });
  
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Charger les catégories au montage du composant
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error('Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      // Pour l'instant, envoyons en JSON (nous gérerons l'upload d'image plus tard)
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        price: formData.price || '0',
        duration_hours: formData.duration_hours || '1',
        difficulty_level: formData.difficulty_level
      };

      console.log('FormationForm - Data to send:', dataToSend);

      await onSubmit(dataToSend);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la formation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajouter une formation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Image d'importation */}
        <div className="flex items-center gap-2 border p-4 border-dashed border-indigo-500 rounded-md cursor-pointer">
          <label className="text-indigo-600 flex items-center gap-2">
            <FiUploadCloud className="text-2xl" />
            <span className="text-sm">Importer l'image de la formation</span>
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {image && (
            <div className="flex items-center gap-2">
              <img
                src={URL.createObjectURL(image)}
                alt="Formation"
                className="w-16 h-16 object-cover rounded-md border"
              />
              <p className="text-sm text-gray-600">{image.name}</p>
            </div>
          )}
        </div>

        {/* Titre de la formation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Titre de la formation</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Description de la formation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Sélection des cours existants */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sélectionner les cours existants</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`course-${course.id}`}
                  value={course.id}
                  onChange={handleCourseSelection}
                  className="form-checkbox h-5 w-5 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor={`course-${course.id}`} className="text-sm text-gray-700">{course.title}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton pour ajouter un nouveau cours */}
        <div className="text-center">
          <Link
            to="/teacher/mes_cours"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
          >
            <BsPlusCircle className="text-xl mr-2" />
            Ajouter un nouveau cours
          </Link>
        </div>

        {/* Bouton de soumission */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
          >
            Enregistrer la formation
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormationForm;
