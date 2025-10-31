import React, { useState } from "react";

const avatarList = [
  "avatar1.svg",
  "avatar2.svg",
  "avatar3.svg",
  "avatar4.svg",
  // Ajoute ici tous les noms de tes fichiers SVG
];

export default function AvatarSelector({ onSelect }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleSelect = (avatar) => {
    setSelectedAvatar(avatar);
    onSelect(avatar); // Envoie l'avatar sélectionné au parent
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Choisis ton avatar :</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {avatarList.map((avatar) => (
          <img
            key={avatar}
            src={`/avatars/${avatar}`}
            alt={avatar}
            className={`w-20 h-20 p-1 border rounded-full cursor-pointer hover:scale-105 transition-transform ${
              selectedAvatar === avatar ? "ring-4 ring-blue-500" : "border-gray-300"
            }`}
            onClick={() => handleSelect(avatar)}
          />
        ))}
      </div>
      {selectedAvatar && (
        <p className="mt-4 text-green-600">
          Avatar sélectionné : <strong>{selectedAvatar}</strong>
        </p>
      )}
    </div>
  );
}
