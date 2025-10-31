// components/Student/Statistics/FeedbackList.jsx
import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

const FeedbackList = ({ evaluations }) => {
  if (!evaluations || evaluations.length === 0) {
    return <p className="text-gray-500">Aucun feedback disponible pour ce cours.</p>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Évaluations du formateur</h3>

      {evaluations.map((evalItem, idx) => (
        <div key={idx} className="border-b pb-3">
          <div className="flex items-center text-yellow-400 mb-1">
            {Array.from({ length: 5 }).map((_, i) =>
              i < evalItem.note ? <FaStar key={i} /> : <FaRegStar key={i} />
            )}
          </div>
          <p className="text-gray-700 text-sm italic">"{evalItem.comment}"</p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackList;
