import React from "react";

const FormationSelector = ({ formations, selectedFormationId, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">Sélectionner une formation :</label>
      <select
        className="border rounded px-3 py-2 w-full"
        value={selectedFormationId || ""}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">-- Choisir une formation --</option>
        {formations.map(f => (
          <option key={f.id} value={f.id}>{f.title || f.nom || f.name}</option>
        ))}
      </select>
    </div>
  );
};

export default FormationSelector;
