/* eslint-disable no-unused-vars */
// src/pages/Teacher/Evaluations/Evaluations.jsx

import React, { useState, useEffect } from "react";
import useEvaluationApi from '@/hooks/useEvaluationApi';
import EvaluationTable from "@/components/Teacher/Evaluation/EvaluationTable";
import EvaluationFormPanel from "@/components/Teacher/Evaluation/EvaluationFormPanel";
import EvaluationHistory from "@/components/Teacher/Evaluation/EvaluationHistory";
import useCourses from '@/hooks/useCourses';
import useFormations from '@/hooks/useFormations';
import FormationSelector from '@/components/Teacher/Etudiants/FormationSelector';
import StudentTable from '@/components/Teacher/Etudiants/StudentTable';
import CourseSelector from '@/components/Teacher/Etudiants/CourseSelector';

const Evaluation = () => {
  const { courses, loading: loadingCourses } = useCourses();
  const { formations, loading: loadingFormations } = useFormations();
  const [selectedFormationId, setSelectedFormationId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [formationStudents, setFormationStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Historique des évaluations (initialement vide)
  const [pastEvaluations, setPastEvaluations] = useState([]);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { fetchEvaluation, saveEvaluation } = useEvaluationApi();

  // Charger les données réelles des étudiants/cours pour la table d'évaluation
  // Charger les étudiants de la formation sélectionnée
  useEffect(() => {
    if (!loadingFormations && !loadingCourses && formations && Array.isArray(formations) && selectedFormationId) {
      const formation = formations.find(f => String(f.id) === String(selectedFormationId));
      if (formation && Array.isArray(formation.studentsList)) {
        // Récupérer tous les cours de cette formation
        const formationCourses = courses.filter(c => String(c.formation_id) === String(selectedFormationId));
        // Pour chaque étudiant, calculer la moyenne de progression sur tous les cours de la formation
        const students = formation.studentsList.map(student => {
          // Trouver toutes les progressions de cet étudiant dans les cours de la formation
          const progresses = formationCourses.map(course => {
            const found = (course.studentsList || []).find(s => String(s.id) === String(student.id));
            return found ? (found.progress ?? found.progress_percentage ?? 0) : null;
          }).filter(p => p !== null);
          const avgProgress = progresses.length > 0 ? Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length) : 0;
          return {
            id: student.id,
            avatar: student.avatar || `https://i.pravatar.cc/100?u=${student.id}`,
            name: student.nom || student.name || '',
            email: student.email || '',
            tel: student.tel || '',
            enrolled_at: student.enrolled_at || student.created_at || '',
            progress: avgProgress
          };
        });
        setFormationStudents(students);
      } else {
        setFormationStudents([]);
      }
    } else {
      setFormationStudents([]);
    }
  }, [formations, loadingFormations, selectedFormationId, courses, loadingCourses]);

  // Charger les soumissions pour la table d'évaluation (cours)
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!loadingCourses && courses && Array.isArray(courses) && selectedCourseId) {
        let filteredCourses = courses.filter(c => String(c.id) === String(selectedCourseId));
        const allSubmissions = [];
        for (const course of filteredCourses) {
          if (Array.isArray(course.studentsList)) {
            for (const student of course.studentsList) {
              let grade = null;
              let comment = '';
              try {
                const evalData = await fetchEvaluation(course.id, student.id);
                grade = evalData.grade;
                comment = evalData.comment;
              } catch (e) {
                // ignore, pas d'évaluation
              }
              allSubmissions.push({
                id: `${course.id}-${student.id}`,
                avatar: student.avatar || `https://i.pravatar.cc/100?u=${student.id}`,
                nom: student.nom || student.name || '',
                prenom: student.prenom || '',
                tel: student.tel || '',
                email: student.email || '',
                progress: student.progress ?? student.progress_percentage ?? 0,
                courseName: course.title,
                courseId: course.id,
                studentId: student.id,
                grade,
                comment
              });
            }
          }
        }
        setSubmissions(allSubmissions);
      } else {
        setSubmissions([]);
      }
    };
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, loadingCourses, selectedCourseId]);
  const handleEvaluate = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleSaveEvaluation = async ({ submissionId, grade, comment }) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    try {
      await saveEvaluation(submission.courseId, submission.studentId, grade, comment);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId
            ? { ...s, grade, comment }
            : s
        )
      );
      // Ajouter à l'historique uniquement si la note ou le commentaire a changé
      const lastEval = pastEvaluations.find(e =>
        e.nom === submission.nom &&
        e.prenom === submission.prenom &&
        e.courseName === submission.courseName &&
        e.grade === grade &&
        e.comment === comment
      );
      if (!lastEval) {
        setPastEvaluations(prev => [
          {
            id: Date.now(),
            avatar: submission.avatar,
            nom: submission.nom,
            prenom: submission.prenom,
            courseName: submission.courseName,
            grade,
            comment
          },
          ...prev
        ]);
      }
    } catch (e) {
      alert('Erreur lors de la sauvegarde de la note');
    }
    setSelectedSubmission(null);
  };

  // Table des étudiants globale si aucune formation sélectionnée
  // State pour le panneau flottant étudiant
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const allStudents = React.useMemo(() => {
    if (!courses || !Array.isArray(courses)) return [];
    const seen = new Map();
    courses.forEach(course => {
      if (Array.isArray(course.studentsList)) {
        course.studentsList.forEach(student => {
          if (!seen.has(student.id)) {
            seen.set(student.id, {
              id: student.id,
              name: student.name || student.nom || '',
              email: student.email || '',
              tel: student.tel || '',
              avatar: student.avatar || `https://i.pravatar.cc/150?img=${student.id}`,
              formations: new Map()
            });
          }
          // Ajoute la formation à la liste de l'étudiant (par formation_id)
          const s = seen.get(student.id);
          const fid = course.formation_id;
          if (!s.formations.has(fid)) {
            // Force le nom de formation depuis l'objet formations uniquement
            const formationObj = formations.find(f => String(f.id) === String(fid));
            s.formations.set(fid, {
              nom: formationObj ? formationObj.nom : `Formation #${fid}`,
              progression: [],
            });
          }
          // Ajoute la progression du cours à la formation
          s.formations.get(fid).progression.push(student.progress ?? student.progress_percentage ?? 0);
        });
      }
    });
    // Pour chaque formation, calcule la progression moyenne
    return Array.from(seen.values()).map(s => {
      s.formations = Array.from(s.formations.values())
        .map(f => ({
          nom: f.nom,
          avgProgress: f.progression.length ? Math.round(f.progression.reduce((a, b) => a + b, 0) / f.progression.length) : 0
        }))
  .filter(f => f.nom !== 'Formation #undefined');
      return s;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [courses, formations]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Évaluer les étudiants</h2>
      {/* Table globale si aucune formation sélectionnée */}
      {/* Table globale si aucune formation sélectionnée */}
      {!selectedFormationId && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Tous les étudiants</h3>
          </div>
          <StudentTable
            students={allStudents}
            buttonLabel="Formation"
            onShowPanel={setSelectedStudent}
            showInscriptionsCol={false}
          />
          {/* Panneau flottant pour formations de l'étudiant */}
          {selectedStudent && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedStudent(null)}
                >✕</button>
                <div className="flex items-center mb-4">
                  <img src={selectedStudent.avatar} alt="avatar" className="w-16 h-16 rounded-full mr-4" />
                  <div>
                    <div className="font-bold text-lg">{selectedStudent.name}</div>
                    <div className="text-gray-600 text-sm">{selectedStudent.email}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Formations inscrites</h4>
                  <ul className="space-y-2">
                    {selectedStudent.formations.map((f, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                        <span className="font-medium">{f.nom}</span>
                        <span className="text-sm text-gray-500">Progression moyenne : <span className="font-semibold text-blue-600">{f.avgProgress}%</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Sélection de la formation */}
      <FormationSelector
        formations={formations}
        selectedFormationId={selectedFormationId}
        onChange={id => {
          setSelectedFormationId(id);
          setSelectedCourseId(""); // reset le cours si on change de formation
        }}
      />

      {/* Table des étudiants de la formation sélectionnée */}
      {selectedFormationId && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Étudiants inscrits à la formation</h3>
          <StudentTable students={formationStudents} showInscriptionsCol={false} />
        </div>
      )}

      {/* Sélection de cours et table d'évaluation, seulement si une formation est sélectionnée */}
      {selectedFormationId && (
        <>
          <div className="mt-4">
            {(() => {
              const selectedFormation = formations.find(f => String(f.id) === String(selectedFormationId));
              const formationCourses = selectedFormation?.courses || [];
              return (
                <CourseSelector
                  courses={formationCourses.map(c => ({ id: c.id, title: c.title }))}
                  selectedCourseId={selectedCourseId}
                  onChange={setSelectedCourseId}
                />
              );
            })()}
          </div>
          {selectedCourseId && (
            <EvaluationTable
              submissions={submissions}
              onEvaluate={handleEvaluate}
            />
          )}
        </>
      )}

      {selectedSubmission && (
        <EvaluationFormPanel
          submission={selectedSubmission}
          onSave={handleSaveEvaluation}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
      <EvaluationHistory evaluations={pastEvaluations} />
    </div>
  );
};

export default Evaluation;