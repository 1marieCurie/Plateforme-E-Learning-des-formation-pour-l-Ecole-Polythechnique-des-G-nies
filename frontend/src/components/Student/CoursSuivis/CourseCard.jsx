import React from "react";
import { FaStar, FaRegStar, FaCheckCircle } from "react-icons/fa";


const CourseCard = ({ course }) => {
  const { image, title, lastChapter, rating, progress } = course;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
      <img src={image} alt={title} className="w-full h-40 object-contain p-4 bg-gray-100" />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {progress === 100 && <FaCheckCircle className="text-green-500 text-xl" title="Cours terminé" />}
        </div>
        <p className="text-sm text-gray-600">Dernier chapitre : <strong>{lastChapter}</strong></p>

        {/* Étoiles */}
        <div className="flex gap-1">{renderStars()}</div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 h-3 rounded-full mt-2">
          <div
            className={`h-3 rounded-full ${progress === 100 ? "bg-green-500" : "bg-indigo-500"}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-right text-sm text-gray-500">{progress}%</p>

        {/* Bouton "Continuer" */}
        {progress < 100 && (
          <button className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm">
            Continuer
          </button>
        )}
      </div>
      
    </div>
  );
};

export default CourseCard;
