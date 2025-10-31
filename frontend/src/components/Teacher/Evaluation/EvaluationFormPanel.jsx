// src/components/Teacher/Evaluations/EvaluationFormPanel.jsx

import React, { useState, useEffect } from "react";

const EvaluationFormPanel = ({ submission, onSave, onClose }) => {
  const [grade, setGrade] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (submission) {
      setGrade(submission.grade || "");
      setComment(submission.comment || "");
    }
  }, [submission]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      submissionId: submission.id,
      grade: Number(grade),
      comment,
    });
  };

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-30 border-l border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Évaluer {submission.nom}</h3>
        <button onClick={onClose} className="text-gray-600 hover:text-red-500 text-xl">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">
            Note (/20)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Commentaire (facultatif)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm"
            rows="3"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Valider l’évaluation
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationFormPanel;
