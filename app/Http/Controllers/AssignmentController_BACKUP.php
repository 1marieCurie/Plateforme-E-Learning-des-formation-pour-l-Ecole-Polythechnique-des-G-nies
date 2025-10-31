<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssignmentController extends Controller
{
    /**
     * GET /api/assignments
     * Récupérer les devoirs selon le rôle de l'utilisateur
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if ($user->role === 'etudiant') {
                // Étudiant : ses propres devoirs
                $assignments = Assignment::with(['course', 'course.formation'])
                                        ->where('student_id', $user->id)
                                        ->orderBy('due_date', 'asc')
                                        ->get();
            } elseif ($user->role === 'formateur') {
                // Formateur : devoirs des cours de ses formations
                $courseIds = $user->createdFormations()
                                 ->with('courses')
                                 ->get()
                                 ->pluck('courses')
                                 ->flatten()
                                 ->pluck('id');
                
                $assignments = Assignment::with(['course', 'student'])
                                        ->whereIn('course_id', $courseIds)
                                        ->orderBy('submitted_at', 'desc')
                                        ->get();
            } else {
                // Admin : tous les devoirs
                $assignments = Assignment::with(['course', 'student'])
                                        ->orderBy('created_at', 'desc')
                                        ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $assignments->map(function ($assignment) use ($user) {
                    $data = [
                        'id' => $assignment->id,
                        'title' => $assignment->title,
                        'description' => $assignment->description,
                        'type' => $assignment->type,
                        'status' => $assignment->status,
                        'grade' => $assignment->grade,
                        'feedback' => $assignment->feedback,
                        'due_date' => $assignment->due_date,
                        'submitted_at' => $assignment->submitted_at,
                        'graded_at' => $assignment->graded_at,
                        'is_late' => $assignment->isLate(),
                        'course' => [
                            'id' => $assignment->course->id,
                            'title' => $assignment->course->title
                        ]
                    ];

                    // Ajouter les infos du fichier si présent
                    if ($assignment->file_path) {
                        $data['file'] = [
                            'name' => $assignment->file_name,
                            'size' => $assignment->formatted_file_size,
                            'url' => $assignment->file_url
                        ];
                    }

                    // Ajouter les infos de l'étudiant pour les formateurs/admin
                    if ($user->role !== 'etudiant') {
                        $data['student'] = [
                            'id' => $assignment->student->id,
                            'name' => $assignment->student->name,
                            'email' => $assignment->student->email
                        ];
                    }

                    return $data;
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des devoirs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/assignments
     * Soumettre un devoir (étudiants seulement)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:tp,td,controle,qcm',
            'course_id' => 'required|exists:courses,id',
            'file' => 'required|file|mimes:pdf,doc,docx,txt,zip,rar|max:10240', // 10MB max
            'due_date' => 'nullable|date|after:now'
        ]);

        try {
            $user = Auth::user();
            $course = Course::findOrFail($request->course_id);

            // Vérifier que l'étudiant a accès au cours
            if (!$course->isAccessibleBy($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'avez pas accès à ce cours'
                ], 403);
            }

            // Gérer l'upload du fichier
            $file = $request->file('file');
            $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('assignments', $fileName, 'public');

            // Déterminer le statut
            $status = Assignment::STATUS_SUBMITTED;
            $submittedAt = now();
            
            if ($request->due_date && now() > $request->due_date) {
                $status = Assignment::STATUS_LATE;
            }

            $assignment = Assignment::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'course_id' => $request->course_id,
                'student_id' => $user->id,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'status' => $status,
                'due_date' => $request->due_date,
                'submitted_at' => $submittedAt
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Devoir soumis avec succès',
                'data' => $assignment->load(['course'])
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
     * PUT /api/assignments/{id}/grade
     * Noter un devoir (formateurs seulement)
     */
    public function grade(Request $request, $id)
    {
        $request->validate([
            'grade' => 'required|numeric|min:0|max:20',
            'feedback' => 'nullable|string'
        ]);

        try {
            $user = Auth::user();
            $assignment = Assignment::with(['course.formation'])->findOrFail($id);

            // Vérifier que le formateur est le créateur de la formation
            if ($user->role !== 'admin' && $assignment->course->formation->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à noter ce devoir'
                ], 403);
            }

            $assignment->update([
                'grade' => $request->grade,
                'feedback' => $request->feedback,
                'status' => Assignment::STATUS_GRADED,
                'graded_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Devoir noté avec succès',
                'data' => $assignment->load(['course', 'student'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la notation du devoir',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/courses/{course_id}/assignments
     * Récupérer les devoirs d'un cours spécifique
     */
    public function getCourseAssignments($course_id)
    {
        try {
            $user = Auth::user();
            $course = Course::findOrFail($course_id);

            if ($user->role === 'etudiant') {
                // Vérifier l'accès au cours
                if (!$course->isAccessibleBy($user)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous n\'avez pas accès à ce cours'
                    ], 403);
                }

                // Ses devoirs pour ce cours
                $assignments = Assignment::where('course_id', $course_id)
                                        ->where('student_id', $user->id)
                                        ->orderBy('due_date', 'asc')
                                        ->get();
            } else {
                // Tous les devoirs du cours
                $assignments = Assignment::with(['student'])
                                        ->where('course_id', $course_id)
                                        ->orderBy('submitted_at', 'desc')
                                        ->get();
            }

            return response()->json([
                'success' => true,
                'course' => [
                    'id' => $course->id,
                    'title' => $course->title
                ],
                'data' => $assignments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des devoirs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/assignments/{id}
     * Supprimer un devoir
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $assignment = Assignment::findOrFail($id);

            // Seul l'étudiant propriétaire ou un admin peut supprimer
            if ($user->role !== 'admin' && $assignment->student_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à supprimer ce devoir'
                ], 403);
            }

            // Supprimer le fichier du stockage
            if ($assignment->file_path) {
                Storage::disk('public')->delete($assignment->file_path);
            }

            $assignment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Devoir supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du devoir',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
