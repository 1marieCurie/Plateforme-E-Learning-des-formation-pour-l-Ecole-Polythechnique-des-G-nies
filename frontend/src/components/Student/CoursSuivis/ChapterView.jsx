/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import useChapters from '@/hooks/useChapters';
import { markChapterAsRead } from '@/hooks/useChapterProgressApi';
import { ArrowLeft, Download, BookOpen, Clock, CheckCircle, Circle, Play } from 'lucide-react';
import { courseService } from '@/services/courseService';

const ChapterView = ({ courseId, courseName, onBack }) => {
  const { chapters, loading, error, fetchChapters } = useChapters(courseId);
  const [courseProgress, setCourseProgress] = useState({});
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    // Incrémente le compteur de vues du cours à chaque ouverture de la page
    if (courseId) {
      courseService.incrementView(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      const totalChapters = chapters.length;
      const completedChapters = chapters.filter(ch => ch.is_read).length;
      const progressPercentage = (completedChapters / totalChapters) * 100;
      setCourseProgress({
        total: totalChapters,
        completed: completedChapters,
        percentage: progressPercentage,
        lastChapter: chapters.find(ch => ch.is_read) ?
          chapters.filter(ch => ch.is_read).pop().title :
          "Aucun chapitre commencé"
      });
    } else {
      setCourseProgress({ total: 0, completed: 0, percentage: 0, lastChapter: "Aucun chapitre commencé" });
    }
  }, [chapters]);

  // À adapter : ici il faudrait appeler une API pour marquer comme lu côté backend
  const handleReadChapter = async (chapter) => {
    try {
      // Marquer comme lu côté backend
      await markChapterAsRead(chapter.id);
      // Ouvrir le contenu du chapitre
      window.open(chapter.content_path || chapter.file_url || '#', '_blank');
      // Recharger la liste des chapitres pour mettre à jour la progression
      fetchChapters();
    } catch (error) {
      console.error('Erreur lors de la lecture du chapitre:', error);
      alert('Erreur lors de la mise à jour de la progression du chapitre.');
    }
  };

  const handleDownloadChapter = async (chapter) => {
    try {
      // Marquer comme lu côté backend
      await markChapterAsRead(chapter.id);
      // Si le chapitre a un fichier, on le télécharge
      const url = chapter.content_path || chapter.file_url;
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Aucun fichier à télécharger pour ce chapitre.');
      }
      // Recharger la liste des chapitres pour mettre à jour la progression
      fetchChapters();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des chapitres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header avec retour */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux cours
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{courseName}</h1>
          <p className="text-gray-600">Chapitres du cours</p>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Progression du cours</h2>
          <span className="text-lg font-bold text-indigo-600">
            {Math.round(courseProgress.percentage || 0)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${courseProgress.percentage || 0}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{courseProgress.total || 0}</div>
            <div className="text-sm text-gray-600">Chapitres total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{courseProgress.completed || 0}</div>
            <div className="text-sm text-gray-600">Chapitres lus</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {(courseProgress.total || 0) - (courseProgress.completed || 0)}
            </div>
            <div className="text-sm text-gray-600">Restants</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <strong>Dernier chapitre consulté :</strong> {courseProgress.lastChapter}
        </div>
      </div>

      {/* Liste des chapitres */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Chapitres</h2>
        
        {chapters.map((chapter, index) => (
          <div 
            key={chapter.id}
            className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg ${
              chapter.is_read ? 'border-l-4 border-green-500' : 'border-l-4 border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {chapter.is_read ? (
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 mr-3" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-800">
                    Chapitre {chapter.order_index} : {chapter.title}
                  </h3>
                  {chapter.is_read && (
                    <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Terminé
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3 ml-9">{chapter.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 ml-9">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{chapter.duration_minutes} min de lecture</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleDownloadChapter(chapter)}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section devoirs (aperçu) */}
      
    </div>
  );
};

export default ChapterView;