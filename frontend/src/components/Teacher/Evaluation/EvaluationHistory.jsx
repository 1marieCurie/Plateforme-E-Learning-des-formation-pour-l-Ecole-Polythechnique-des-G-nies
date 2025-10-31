// src/components/Teacher/Evaluation/EvaluationHistory.jsx
import React, { useState } from "react";

const EvaluationHistory = ({ evaluations }) => {
  const [expandedComments, setExpandedComments] = useState({});

  const toggleComment = (id) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Historique des évaluations</h3>
      
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {evaluations.map((evaluation) => (
              <tr key={evaluation.id} className="hover:bg-gray-50">
                {/* Cellule Étudiant avec avatar et nom complet ou fallback */}
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 mr-3">
                      <img 
                        src={evaluation.avatar} 
                        alt={evaluation.nom ? `${evaluation.prenom || ''} ${evaluation.nom}` : evaluation.name || ''}
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate whitespace-nowrap">
                        {evaluation.prenom || ''} {evaluation.nom || evaluation.name || ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center">{evaluation.courseName}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    evaluation.grade >= 16 ? 'bg-green-100 text-green-800' :
                    evaluation.grade >= 12 ? 'bg-blue-100 text-blue-800' :
                    evaluation.grade >= 8 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {evaluation.grade}/20
                  </span>
                </td>
                <td className="px-4 py-3 text-sm max-w-xs">
                  <div className="flex flex-col items-center">
                    <div className={`${!expandedComments[evaluation.id] ? 'line-clamp-2' : ''} text-center`}>
                      {evaluation.comment}
                    </div>
                    {evaluation.comment && evaluation.comment.length > 60 && (
                      <button 
                        onClick={() => toggleComment(evaluation.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                      >
                        {expandedComments[evaluation.id] ? 'Voir moins' : 'Voir plus'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluationHistory;