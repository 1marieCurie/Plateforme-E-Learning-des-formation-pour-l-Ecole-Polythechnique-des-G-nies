// src/components/Teacher/Evaluation/EvaluationTable.jsx
import React from "react";

const EvaluationTable = ({ submissions, onEvaluate }) => (
  <div className="overflow-x-auto bg-white shadow rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Note /20</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {submissions.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-6 py-3 text-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 mr-3">
                  {s.avatar ? (
                    <img
                      src={s.avatar}
                      alt={`${s.nom} ${s.prenom}`}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <span className="text-lg">?</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate whitespace-nowrap">
                    {s.nom} {s.prenom}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-6 py-3 text-sm text-center">{s.courseName}</td>
            <td className="px-6 py-3 text-center text-sm">
              {s.grade !== null ? (
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  s.grade >= 16 ? 'bg-green-100 text-green-800' :
                  s.grade >= 12 ? 'bg-blue-100 text-blue-800' :
                  s.grade >= 8 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {s.grade}/20
                </span>
              ) : "—"}
            </td>
            <td className="px-6 py-3 text-center">
              {s.grade === null ? (
                <button
                  onClick={() => onEvaluate(s)}
                  className="inline-flex px-3 py-1.5 border border-indigo-500 text-indigo-600 rounded hover:bg-indigo-50 text-sm"
                >
                  Évaluer
                </button>
              ) : (
                <button
                  onClick={() => onEvaluate(s)}
                  className="inline-flex px-3 py-1.5 border border-yellow-500 text-yellow-700 rounded hover:bg-yellow-50 text-sm"
                >
                  Modifier
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EvaluationTable;
