import React, { useEffect, useState } from "react";
import useEvaluationApi from '@/hooks/useEvaluationApi';

const EvaluationProfSection = ({ courseId }) => {
  const { fetchEvaluation } = useEvaluationApi();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const studentId = JSON.parse(localStorage.getItem('user'))?.id;
    if (!courseId || !studentId) return;
    setLoading(true);
    fetchEvaluation(courseId, studentId)
      .then(data => {
        if (mounted) setEvaluation(data);
      })
      .catch(() => {
        if (mounted) setEvaluation(null);
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [courseId, fetchEvaluation]);

  if (loading) return null;
  if (!evaluation || evaluation.grade == null) return null;

  return (
    <div className="mt-8 bg-white border border-indigo-200 rounded-xl p-6 shadow flex flex-col gap-3 max-w-lg mx-auto text-center">
      <div className="flex flex-col items-center gap-2 mb-2">
        <svg className="w-8 h-8 text-indigo-500 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-2xl font-bold text-indigo-700">Évaluation du professeur</h3>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-gray-600 font-medium">Note :</span>
          <span className="text-3xl font-extrabold text-indigo-900 bg-indigo-50 px-4 py-2 rounded-lg shadow-sm">{evaluation.grade}</span>
          <span className="text-gray-500 text-lg">/20</span>
        </div>
        {evaluation.comment && (
          <div className="flex items-center gap-2 justify-center">
            <span className="text-gray-600 font-medium">Commentaire :</span>
            <span className="italic text-gray-800 bg-gray-50 px-3 py-1 rounded">{evaluation.comment}</span>
          </div>
        )}
      </div>
      {evaluation.evaluated_at && (
        <div className="text-xs text-gray-400 mt-1">Évalué le {new Date(evaluation.evaluated_at).toLocaleDateString()}</div>
      )}
    </div>
  );
};

export default EvaluationProfSection;
