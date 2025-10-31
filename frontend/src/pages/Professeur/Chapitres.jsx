import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useCourses } from '@/hooks/useCourses';
import { useChapters } from '@/hooks/useChapters';
import CourseSelector from "@/components/Teacher/Chapitres/CourseSelector";
import ChapterList from "@/components/Teacher/Chapitres/ChapterList";

const ChapitresCours = () => {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editedChapter, setEditedChapter] = useState(null);

  const [newChapter, setNewChapter] = useState({
    titre: "",
    description: "",
    video: "",
    file: null,
  });

  // État pour la gestion de l'upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // Utiliser les hooks pour récupérer les vraies données
  const { 
    courses, 
    loading: coursesLoading, 
    fetchCourses 
  } = useCourses();

  const { 
    chapters, 
    loading: chaptersLoading, 
    createChapter, 
    updateChapter, 
    deleteChapter, 
    fetchChapters 
  } = useChapters(selectedCourseId);

  // Charger les cours du formateur au montage
  useEffect(() => {
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Charger les chapitres quand un cours est sélectionné
  useEffect(() => {
    if (selectedCourseId) {
      fetchChapters(selectedCourseId);
    }
  }, [selectedCourseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce chapitre ?")) {
      return;
    }

    try {
      await deleteChapter(chapterId);
      toast.success("Chapitre supprimé avec succès");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression du chapitre");
      console.error(error);
    }
  };

  const handleEditChapter = (chapter) => {
    setEditedChapter(chapter);
    setIsAddingChapter(false); // fermer l'ajout si modification
  };

  const resetForm = () => {
    setNewChapter({ titre: "", description: "", video: "", file: null });
    setProgress(0);
    setUploadError(null);
  };

  const handleAddChapter = async () => {
    // Validation côté client
    if (!newChapter.titre.trim()) {
      toast.error("Le titre du chapitre est requis");
      return;
    }
    
    if (!selectedCourseId) {
      toast.error("Veuillez sélectionner un cours");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadError(null);

    try {
      // Création du chapitre avec gestion de progression
      await createChapter({
        titre: newChapter.titre,
        description: newChapter.description,
        video: newChapter.video,
        file: newChapter.file,
        course_id: selectedCourseId
      }, (percent) => {
        setProgress(percent);
      });

      // Succès
      setProgress(100);
      toast.success("Chapitre créé avec succès");
      
      // Fermer le formulaire et réinitialiser
      setIsAddingChapter(false);
      resetForm();

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setUploadError(error.message);
      toast.error(error.message || "Erreur lors de la création du chapitre");
      setProgress(0);
    } finally {
      setUploading(false);
      // Masquer la barre de progression après 2 secondes
      setTimeout(() => {
        setProgress(0);
        setUploadError(null);
      }, 2000);
    }
  };

  const handleUpdateChapter = async (chapterData) => {
    if (!editedChapter) return;
    setUploading(true);
    setProgress(0);
    setUploadError(null);
    try {
      await updateChapter(editedChapter.id, {
        ...chapterData,
        onProgress: (percent) => setProgress(percent)
      });
      setProgress(100);
      toast.success("Chapitre mis à jour avec succès");
      setEditedChapter(null);
      resetForm();
    } catch (error) {
      setUploadError(error.message);
      toast.error(error.message || "Erreur lors de la mise à jour du chapitre");
      setProgress(0);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setProgress(0);
        setUploadError(null);
      }, 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation de la taille (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB en bytes
    if (file.size > maxSize) {
      toast.error("Le fichier ne peut pas dépasser 50MB");
      e.target.value = ""; // Reset input
      return;
    }

    // Types de fichiers acceptés
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi',
      'video/quicktime'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non supporté. Utilisez PDF, Word, PowerPoint, images ou vidéos.");
      e.target.value = ""; // Reset input
      return;
    }

    if (editedChapter) {
      setEditedChapter({ ...editedChapter, file });
    } else {
      setNewChapter({ ...newChapter, file });
    }

    // Afficher des infos sur le fichier
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    toast.info(`Fichier sélectionné: ${file.name} (${sizeInMB} MB)`);
  };

  // Obtenir les chapitres du cours sélectionné
  const selectedCourseChapters = chapters || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestion des chapitres</h1>

      {/* Ligne avec dropdown + bouton */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex-1">
          <CourseSelector
            courses={courses}
            selectedCourseId={selectedCourseId}
            onSelect={setSelectedCourseId}
            loading={coursesLoading}
          />
        </div>

        {selectedCourseId && (
          <button
            onClick={() => {
              setIsAddingChapter(true);
              setEditedChapter(null); // fermer le panel d'édition s'il était ouvert
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-indigo-500 bg-white text-indigo-700 rounded-lg shadow hover:bg-indigo-50 transition"
          >
            <span className="text-xl">+</span> Ajouter un chapitre
          </button>
        )}
      </div>

      {/* Section centrale avec panel latéral à droite */}
      {selectedCourseId && (
        <div className="flex gap-6">
          {/* Liste des chapitres */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 Chapitres du cours :{" "}
              <span className="text-indigo-600">
                {courses.find((c) => c.id.toString() === selectedCourseId)?.title}
              </span>
            </h2>

            {chaptersLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Chargement des chapitres...</p>
              </div>
            ) : (
              <ChapterList
                chapitres={selectedCourseChapters}
                onEdit={handleEditChapter}
                onDelete={handleDeleteChapter}
              />
            )}
          </div>

          {/* Panel latéral : soit ajout, soit édition */}
          {(isAddingChapter || editedChapter) && (
            <div className="w-[400px] bg-white border border-indigo-200 shadow-lg rounded-md p-4">
              <h3 className="text-lg font-bold text-indigo-700 mb-4">
                {editedChapter ? "Modifier le chapitre" : "Ajouter un nouveau chapitre"}
              </h3>

              {/* Formulaire commun */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre du chapitre *
                  </label>
                  <input
                    type="text"
                    placeholder="Entrez le titre du chapitre"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedChapter ? editedChapter.titre : newChapter.titre}
                    onChange={(e) => {
                      if (editedChapter)
                        setEditedChapter({ ...editedChapter, titre: e.target.value });
                      else
                        setNewChapter({ ...newChapter, titre: e.target.value });
                    }}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Description du chapitre (optionnel)"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedChapter ? editedChapter.description : newChapter.description}
                    onChange={(e) => {
                      if (editedChapter)
                        setEditedChapter({ ...editedChapter, description: e.target.value });
                      else
                        setNewChapter({ ...newChapter, description: e.target.value });
                    }}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien vidéo (optionnel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editedChapter ? editedChapter.video : newChapter.video}
                    onChange={(e) => {
                      if (editedChapter)
                        setEditedChapter({ ...editedChapter, video: e.target.value });
                      else
                        setNewChapter({ ...newChapter, video: e.target.value });
                    }}
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fichier du chapitre (optionnel)
                  </label>
                  <label className="block border-2 border-dashed border-indigo-300 rounded-lg px-4 py-6 cursor-pointer hover:bg-indigo-50 text-center transition">
                    <div className="text-indigo-600">
                      <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-medium">
                        📁 Choisir un fichier
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, PowerPoint, Images, Vidéos (Max: 50MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                    />
                  </label>
                  
                  {/* Affichage du fichier sélectionné ou actuel */}
                  {editedChapter && editedChapter.file && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border text-sm">
                      <strong>Fichier actuel:</strong> {typeof editedChapter.file === 'string' ? editedChapter.file : editedChapter.file.name}
                    </div>
                  )}
                  {!editedChapter && newChapter.file && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border text-sm">
                      <strong>Fichier sélectionné:</strong> {newChapter.file.name}
                    </div>
                  )}
                </div>

                {/* Barre de progression et gestion d'erreurs */}
                {(uploading || progress > 0) && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        {uploading ? "Importation en cours..." : "Terminé"}
                      </span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                )}

                {/* Affichage des erreurs */}
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-red-700">
                        <strong>Erreur:</strong> {uploadError}
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setEditedChapter(null);
                      setIsAddingChapter(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    disabled={uploading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (editedChapter) {
                        handleUpdateChapter(editedChapter);
                      } else {
                        handleAddChapter();
                      }
                    }}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploading || (!editedChapter && !newChapter.titre.trim())}
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importation...
                      </div>
                    ) : (
                      editedChapter ? "Enregistrer" : "Ajouter"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapitresCours;