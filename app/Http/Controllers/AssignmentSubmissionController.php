<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentGrade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssignmentSubmissionController extends Controller
{
    /**
     * POST /api/assignments/{assignment_id}/submit
     * Soumettre un devoir
     */
    public function submit(Request $request, $assignment_id)
    {
        $request->validate([
            'submission_text' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,txt,zip,rar,jpg,png|max:10240' // 10MB max
        ]);

        try {
            $user = Auth::user();
            $assignment = Assignment::findOrFail($assignment_id);

            // Vérifier que l'utilisateur a accès au cours
            if (!$assignment->course->isAccessibleBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'avez pas accès à ce cours'
                ], 403);
            }

            // Vérifier que le devoir est disponible
            if (!$assignment->isAvailable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce devoir n\'est pas disponible'
                ], 400);
            }

            // Vérifier si l'étudiant a déjà soumis
            if ($assignment->hasSubmissionFrom($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous avez déjà soumis ce devoir'
                ], 400);
            }

            // Vérifier qu'il y a au moins un fichier ou du texte
            if (!$request->hasFile('file') && !$request->submission_text) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous devez fournir soit un fichier soit du texte'
                ], 400);
            }

            $submissionData = [
                'assignment_id' => $assignment_id,
                'user_id' => $user->id,
                'submission_text' => $request->submission_text,
                'submitted_at' => now(),
                'is_late' => $assignment->isPastDue() && !$assignment->allow_late_submission
            ];

            // Gérer l'upload du fichier
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $user->id . '_' . Str::slug($assignment->title) . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('assignment_submissions', $fileName, 'public');

                $submissionData['file_path'] = $filePath;
                $submissionData['original_filename'] = $file->getClientOriginalName();
            }

            $submission = AssignmentSubmission::create($submissionData);

            return response()->json([
                'success' => true,
                'message' => 'Devoir soumis avec succès',
                'data' => $submission->load(['assignment'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la soumission du devoir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/assignments/{assignment_id}/submissions
     * Récupérer les soumissions d'un devoir (formateurs/admin)
     */
    public function getSubmissions($assignment_id)
    {
        try {
            $user = Auth::user();
            $assignment = Assignment::with(['course.formation'])->findOrFail($assignment_id);

            // Vérifier les permissions
            if ($user->role !== 'admin' && $assignment->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à voir ces soumissions'
                ], 403);
            }

            $submissions = AssignmentSubmission::with(['student', 'grade'])
                                              ->where('assignment_id', $assignment_id)
                                              ->orderBy('submitted_at', 'desc')
                                              ->get();

            return response()->json([
                'success' => true,
                'assignment' => [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'course' => $assignment->course->title,
                    'max_points' => $assignment->max_points
                ],
                'data' => $submissions->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'student' => [
                            'id' => $submission->student->id,
                            'name' => $submission->student->name,
                            'email' => $submission->student->email
                        ],
                        'submission_type' => $submission->submission_type,
                        'file_url' => $submission->file_url,
                        'original_filename' => $submission->original_filename,
                        'submission_text' => $submission->submission_text,
                        'submitted_at' => $submission->submitted_at,
                        'is_late' => $submission->is_late,
                        'grade' => $submission->grade ? [
                            'points_earned' => $submission->grade->points_earned,
                            'total_points' => $submission->grade->total_points,
                            'grade' => $submission->grade->grade,
                            'percentage' => $submission->grade->percentage,
                            'mention' => $submission->grade->mention,
                            'feedback' => $submission->grade->feedback,
                            'graded_at' => $submission->grade->graded_at
                        ] : null
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des soumissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/submissions/{submission_id}/grade
     * Noter une soumission (formateurs/admin)
     */
    public function grade(Request $request, $submission_id)
    {
        $request->validate([
            'points_earned' => 'required|integer|min:0',
            'feedback' => 'nullable|string'
        ]);

        try {
            $user = Auth::user();
            $submission = AssignmentSubmission::with(['assignment'])->findOrFail($submission_id);

            // Vérifier les permissions
            if ($user->role !== 'admin' && $submission->assignment->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à noter cette soumission'
                ], 403);
            }

            $totalPoints = $submission->assignment->max_points;
            $pointsEarned = min($request->points_earned, $totalPoints); // Ne pas dépasser le maximum

            // Calculer la note sur 20
            $grade = ($pointsEarned / $totalPoints) * 20;

            // Vérifier si une note existe déjà
            $existingGrade = $submission->grade;

            if ($existingGrade) {
                // Mettre à jour la note existante
                $existingGrade->update([
                    'grade' => $grade,
                    'points_earned' => $pointsEarned,
                    'total_points' => $totalPoints,
                    'feedback' => $request->feedback,
                    'graded_at' => now()
                ]);
                $gradeRecord = $existingGrade;
            } else {
                // Créer une nouvelle note
                $gradeRecord = AssignmentGrade::create([
                    'assignment_submission_id' => $submission_id,
                    'graded_by' => $user->id,
                    'grade' => $grade,
                    'points_earned' => $pointsEarned,
                    'total_points' => $totalPoints,
                    'feedback' => $request->feedback,
                    'graded_at' => now()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Soumission notée avec succès',
                'data' => [
                    'submission_id' => $submission->id,
                    'student' => $submission->student->name,
                    'grade' => [
                        'points_earned' => $gradeRecord->points_earned,
                        'total_points' => $gradeRecord->total_points,
                        'grade' => $gradeRecord->grade,
                        'percentage' => $gradeRecord->percentage,
                        'mention' => $gradeRecord->mention,
                        'feedback' => $gradeRecord->feedback,
                        'graded_at' => $gradeRecord->graded_at
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la notation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/my-submissions
     * Récupérer les soumissions de l'étudiant connecté
     */
    public function getMySubmissions()
    {
        try {
            $user = Auth::user();

            $submissions = AssignmentSubmission::with(['assignment.course', 'grade'])
                                              ->where('user_id', $user->id)
                                              ->orderBy('submitted_at', 'desc')
                                              ->get();

            return response()->json([
                'success' => true,
                'data' => $submissions->map(function ($submission) {
                    return [
                        'id' => $submission->id,
                        'assignment' => [
                            'id' => $submission->assignment->id,
                            'title' => $submission->assignment->title,
                            'type' => $submission->assignment->type,
                            'course' => $submission->assignment->course->title
                        ],
                        'submission_type' => $submission->submission_type,
                        'submitted_at' => $submission->submitted_at,
                        'is_late' => $submission->is_late,
                        'file_url' => $submission->file_url,
                        'original_filename' => $submission->original_filename,
                        'grade' => $submission->grade ? [
                            'points_earned' => $submission->grade->points_earned,
                            'total_points' => $submission->grade->total_points,
                            'grade' => $submission->grade->grade,
                            'percentage' => $submission->grade->percentage,
                            'mention' => $submission->grade->mention,
                            'feedback' => $submission->grade->feedback,
                            'graded_at' => $submission->grade->graded_at
                        ] : null
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de vos soumissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
