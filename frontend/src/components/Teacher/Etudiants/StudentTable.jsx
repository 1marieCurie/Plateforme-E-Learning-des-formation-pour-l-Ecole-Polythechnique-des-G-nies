/* eslint-disable no-unused-vars */
// src/components/Teacher/Etudiants/StudentTable.jsx

import React, { useState } from "react";
import { FiDownload, FiMessageSquare } from "react-icons/fi";

const StudentTable = ({ students, buttonLabel = "Inscriptions", onShowPanel, showInscriptionsCol = true }) => {
  const [panelStudent, setPanelStudent] = useState(null);
  // Helper pour formater la date d'inscription au cours
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString();
  };

  // Détecte si la colonne progression doit être affichée (si au moins un étudiant a une valeur définie)
  const showProgressCol = students.some(s => typeof s.progress === 'number');
  const showDateCol = showProgressCol;
  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
      <table className="min-w-full text-sm text-gray-700 bg-white">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-center">Étudiant</th>
            {showProgressCol && (
              <th className="px-4 py-3 text-center">Progression moyenne</th>
            )}
            <th className="px-4 py-3 text-center">Email</th>
            <th className="px-4 py-3 text-center">Téléphone</th>
            {showDateCol && (
              <th className="px-4 py-3 text-center">Date d'inscription à la formation</th>
            )}
            {showInscriptionsCol && (
              <th className="px-4 py-3 text-center">Inscriptions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={showProgressCol ? (showDateCol ? 5 : 4) : 4} className="text-center py-6 text-gray-500">
                Aucun étudiant inscrit dans cette formation.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="border-t hover:bg-gray-50 transition">
                {/* Avatar + nom */}
                <td className="px-4 py-4 flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <div className="font-semibold">{student.name}</div>
                  </div>
                </td>
                {/* Progression moyenne */}
                {showProgressCol && (
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{ width: `${student.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{student.progress || 0}%</span>
                    </div>
                  </td>
                )}
                <td className="px-4 py-4">{student.email}</td>
                <td className="px-4 py-4">{student.tel}</td>
                {showDateCol && (
                  <td className="px-4 py-4">{formatDate(student.enrolled_at)}</td>
                )}
                {showInscriptionsCol && (
                  <td className="px-4 py-4">
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow font-medium transition"
                      onClick={() => setPanelStudent(student)}
                    >
                      Formations
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Panneau flottant des inscriptions */}
      {panelStudent && (
        <div
          className="fixed top-1/2 left-1/2 z-50 bg-white rounded-xl shadow-2xl border border-indigo-200 p-6"
          style={{
            transform: 'translate(-50%, -50%)',
            minWidth: '320px',
            maxWidth: '90vw',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <button
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl focus:outline-none z-10"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setPanelStudent(null)}
            aria-label="Fermer"
          >
            &times;
          </button>
          <div className="flex flex-col items-center mb-6">
            <img
              src={panelStudent.avatar}
              alt={panelStudent.name}
              className="w-16 h-16 rounded-full object-cover border mb-2"
            />
            <h2 className="text-2xl font-bold text-indigo-700 text-center mb-1">{panelStudent.name}</h2>
            <div className="text-lg font-semibold text-gray-600 text-center mt-2 mb-1">Formations inscrites</div>
          </div>
          <div className="space-y-2">
            {/* On suppose que panelStudent.formations est un tableau [{ nom, avgProgress }] */}
            {(Array.isArray(panelStudent.formations) && panelStudent.formations.length > 0) ? (
              panelStudent.formations.map((formation, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-indigo-50 transition">
                  <span className="font-medium text-gray-800 text-base">{formation.nom}</span>
                  <span className="text-indigo-600 font-semibold text-base">{formation.avgProgress}%</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">Aucune formation trouvée pour cet étudiant.</div>
            )}
          </div>
          <button
            className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium"
            onClick={() => setPanelStudent(null)}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
