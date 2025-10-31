/* eslint-disable no-unused-vars */


import React, { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { FiX, FiUploadCloud, FiVideo, FiEdit3, FiClock } from "react-icons/fi";

const ChapterEditPanel = ({ chapter, onClose, onSave }) => {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [duree, setDuree] = useState("");
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    if (chapter) {
      setTitre(chapter.titre || "");
      setDescription(chapter.description || "");
      setVideoLink(chapter.video || "");
      setDuree(chapter.duree || "");
    }
  }, [chapter]);

  const styles = useSpring({
    transform: chapter ? "translateX(0%)" : "translateX(100%)",
    opacity: chapter ? 1 : 0,
    config: { tension: 250, friction: 30 },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
    ...chapter,
    titre,
    description,
    video: videoLink,
    duree,
    file: newFile,
    });
    onClose();
  };

  return (
    <animated.div
      style={styles}
      className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-50 shadow-lg border-l border-gray-200 overflow-y-auto"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
          <FiEdit3 /> Modifier le chapitre
        </h2>
        <button onClick={onClose}>
          <FiX className="text-gray-500 hover:text-red-500 text-xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre du chapitre"
          className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du chapitre"
          rows={4}
          className="w-full px-3 py-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
        />

        <div className="flex items-center gap-2 border px-3 py-2 rounded focus-within:ring-1 focus-within:ring-indigo-500">
          <FiVideo className="text-indigo-500" />
          <input
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="Lien vidéo (YouTube, Vimeo...)"
            className="flex-1 text-sm outline-none"
          />
        </div>

        {/* ✅ Champ de durée */}
        <div className="flex items-center gap-2 border px-3 py-2 rounded focus-within:ring-1 focus-within:ring-indigo-500">
          <FiClock className="text-indigo-500" />
          <input
            type="text"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            placeholder="Durée du chapitre (ex: 15 min)"
            className="flex-1 text-sm outline-none"
          />
        </div>

        {/* ✅ Zone stylée pour importer un fichier */}
        <label className="block border-2 border-indigo-500 rounded px-4 py-4 cursor-pointer hover:bg-indigo-50 text-sm font-medium text-gray-700 transition text-center">
          <div className="flex items-center justify-center gap-2">
            <FiUploadCloud className="text-indigo-500 text-xl" />
            📁 Choisir un fichier du chapitre
          </div>
          <input
            type="file"
            accept=".pdf,.docx,.pptx,.zip"
            onChange={(e) => setNewFile(e.target.files[0])}
            className="hidden"
          />
          {newFile && (
            <p className="text-indigo-600 mt-2 font-medium text-sm">
              ✅ {newFile.name}
            </p>
          )}
        </label>

        <div className="text-right">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded text-sm"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </animated.div>
  );
};

export default ChapterEditPanel;
