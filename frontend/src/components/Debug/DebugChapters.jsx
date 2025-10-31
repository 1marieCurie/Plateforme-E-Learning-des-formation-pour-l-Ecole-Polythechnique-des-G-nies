import React, { useState } from 'react';
import { useChapters } from '@/hooks/useChapters';
import { toast } from 'react-toastify';

const DebugChapters = () => {
  const [courseId] = useState('63'); // ID du cours "Introduction à Express"
  const { 
    chapters, 
    loading, 
    createChapter, 
    fetchChapters 
  } = useChapters(courseId);

  // Ajout d'un formulaire d'import de chapitre
  const [form, setForm] = useState({
    titre: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm(f => ({ ...f, file: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setProgress(0);
    try {
      // Simule la progression (fetch ne donne pas la progression nativement)
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 10 : p));
      }, 200);
      await createChapter({
        titre: form.titre,
        description: form.description,
        course_id: courseId,
        file: form.file
      });
      clearInterval(interval);
      setProgress(100);
      toast.success('Chapitre importé avec succès !');
      setForm({ titre: '', description: '', file: null });
    } catch {
      setProgress(0);
      toast.error('Erreur lors de l\'importation du chapitre');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const refreshChapters = async () => {
    console.log('Refresh chapitres pour cours:', courseId);
    await fetchChapters(courseId);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Chapters</h1>
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-bold mb-2">Configuration</h3>
        <p>Course ID: {courseId}</p>
        <p>Nombre de chapitres: {chapters?.length || 0}</p>
        <p>Loading: {loading ? 'Oui' : 'Non'}</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-bold mb-2">Importer un chapitre</h3>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            name="titre"
            placeholder="Titre du chapitre"
            value={form.titre}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            rows={2}
          />
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={uploading}
          >
            {uploading ? 'Importation...' : 'Importer'}
          </button>
        </form>
        {uploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${progress}%`, transition: 'width 0.2s' }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 mt-1">Importation : {progress}%</div>
          </div>
        )}
        <button 
          onClick={refreshChapters}
          className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        >
          Rafraîchir les chapitres
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-bold mb-2">Chapitres existants</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <ul>
            {chapters?.map(chapter => (
              <li key={chapter.id} className="mb-2 p-2 bg-gray-50 rounded">
                <strong>{chapter.titre}</strong>
                <br />
                <small>ID: {chapter.id} | Description: {chapter.description}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DebugChapters;
