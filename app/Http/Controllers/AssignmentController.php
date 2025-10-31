<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssignmentController extends Controller{

    /**
     * POST /api/assignments (formateur)
     * Créer un devoir (sujet) par un formateur
     */
   /**
 * POST /api/assignments (formateur)
 * Créer un devoir (sujet) par un formateur
 */

/**
 * POST /api/assignments (formateur)
 * Créer un devoir (sujet) par un formateur
 */
public function storeTeacherAssignment(Request $request)
{
    $request->validate([
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'type' => 'required|in:tp,td,controle,qcm',
        'course_id' => 'required|exists:courses,id',
        'due_date' => 'nullable|date|after:now',
        'max_points' => 'nullable|integer|min:1',
        'criteria' => 'nullable|string',
        'is_active' => 'nullable|boolean',
        'file' => 'nullable|file|mimes:pdf,doc,docx,txt,zip,rar|max:10240',
    ]);

    try {
        $user = Auth::user();
        $course = Course::findOrFail($request->course_id);

        // Vérifier que le formateur est bien propriétaire du cours
        if ($user->role !== 'formateur') {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les formateurs peuvent créer des devoirs'
            ], 403);
        }

        // Vérifier si le formateur a accès au cours
        $hasAccess = false;
        if (isset($course->teacher_id) && $course->teacher_id == $user->id) {
            $hasAccess = true;
        } else {
            $userFormationIds = $user->createdFormations()->pluck('id');
            $courseFormationId = $course->formation_id ?? null;
            if ($courseFormationId && $userFormationIds->contains($courseFormationId)) {
                $hasAccess = true;
            }
        }

        if (!$hasAccess) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à créer un devoir sur ce cours',
                'debug' => [
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'course_teacher_id' => $course->teacher_id ?? null,
                    'course_formation_id' => $course->formation_id ?? null,
                    'user_formations' => $user->createdFormations()->pluck('id')->toArray()
                ]
            ], 403);
        }

        // Gestion du fichier
        $filePath = null;
        $fileName = null;
        $fileType = null;
        $fileSize = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('assignments', $fileName, 'public');
            $fileType = $file->getMimeType();
            $fileSize = $file->getSize();
        }
        
        $assignment = Assignment::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'course_id' => $request->course_id,
            'teacher_id' => $user->id,
            'due_date' => $request->due_date,
            'max_points' => $request->max_points ?? 20,
            'instructions' => $request->criteria ? [$request->criteria] : [],
            'is_active' => $request->is_active ?? true,
            'allow_late_submission' => $request->allow_late_submission ?? false,
            'available_from' => now(),
            'available_until' => $request->due_date,
            // Champs de fichier (si vous avez choisi l'option A)
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_type' => $fileType,
            'file_size' => $fileSize,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Devoir créé avec succès',
            'data' => $assignment->load(['course'])
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création du devoir',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * POST /api/assignments/{assignment}/submit (étudiant)
     * Soumettre une copie d'un devoir existant
     */
    public function submitStudentAssignment(Request $request, $assignmentId)
    {
        try {
            // Validate the request
            $request->validate([
                'file' => 'required|file|mimes:pdf,doc,docx,txt,zip,rar|max:10240'
            ]);

            $user = Auth::user();
            $assignment = Assignment::findOrFail($assignmentId);

            // Check if the user is a student and has access
            if ($user->role !== 'etudiant') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les étudiants peuvent soumettre un devoir'
                ], 403);
            }

            // Autoriser la soumission tant que la date limite n'est pas dépassée
            if ($assignment->due_date && now()->greaterThan($assignment->due_date)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La date limite de soumission est dépassée'
                ], 403);
            }

            // Handle file upload
            $file = $request->file('file');
            $fileName = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('submissions', $fileName, 'public');

            // Create the submission
            $submission = AssignmentSubmission::create([
                'assignment_id' => $assignment->id,
                'student_id' => $user->id,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'submitted_at' => now(),
            ]);

            // Optionally update assignment status if needed

            return response()->json([
                'success' => true,
                'message' => 'Devoir soumis avec succès',
                'data' => $submission
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
     * GET /api/assignments
     * Récupérer les devoirs selon le rôle de l'utilisateur
     */
 public function index(Request $request)
{
    try {
        $user = Auth::user();
        $data = collect();

        if ($user->role === 'etudiant') {
            // Récupérer les IDs des formations où l'étudiant est inscrit
            $formationIds = $user->formations()->pluck('formations.id')->toArray();

            // Récupérer les devoirs dont le cours appartient à ces formations
            $assignments = Assignment::with(['course.formation', 'teacher'])
                ->where('is_active', true)
                ->whereHas('course', function($q) use ($formationIds) {
                    $q->whereIn('formation_id', $formationIds);
                })
                ->orderBy('due_date', 'asc')
                ->get();

            foreach ($assignments as $assignment) {
                $data->push($assignment);
            }

        } elseif ($user->role === 'formateur') {
            $courseIds = $user->createdFormations()
                ->with('courses')
                ->get()
                ->pluck('courses')
                ->flatten()
                ->pluck('id');

            $assignments = Assignment::with(['course'])
                ->whereIn('course_id', $courseIds)
                ->orderBy('created_at', 'desc')
                ->get();

            $assignmentIds = $assignments->pluck('id');
            $submissions = AssignmentSubmission::with(['assignment', 'assignment.course', 'user'])
                ->whereIn('assignment_id', $assignmentIds)
                ->get();

            foreach ($assignments as $assignment) {
                $data->push([
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'type' => $assignment->type,
                    'status' => $assignment->status,
                    'due_date' => $assignment->due_date,
                    'max_points' => $assignment->max_points,
                    'created_at' => $assignment->created_at,
                    'is_assignment' => true,
                    'course' => [
                        'id' => $assignment->course->id,
                        'title' => $assignment->course->title
                    ],
                    'submissions_count' => $submissions->where('assignment_id', $assignment->id)->count()
                ]);
            }

            foreach ($submissions as $submission) {
                $data->push([
                    'id' => $submission->id,
                    'title' => $submission->assignment->title,
                    'description' => $submission->assignment->description,
                    'type' => $submission->assignment->type,
                    'status' => 'received',
                    'submitted_at' => $submission->submitted_at,
                    'file_name' => $submission->file_name,
                    'is_assignment' => false,
                    'student' => [
                        'id' => $submission->user->id,
                        'name' => $submission->user->name,
                        'email' => $submission->user->email
                    ],
                    'course' => [
                        'id' => $submission->assignment->course->id,
                        'title' => $submission->assignment->course->title
                    ]
                ]);
            }

        } else {
            $assignments = Assignment::with(['course'])->orderBy('created_at', 'desc')->get();
            $submissions = AssignmentSubmission::with(['assignment', 'assignment.course', 'user'])->get();

            foreach ($assignments as $assignment) {
                $data->push([
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'type' => $assignment->type,
                    'status' => $assignment->status,
                    'due_date' => $assignment->due_date,
                    'max_points' => $assignment->max_points,
                    'created_at' => $assignment->created_at,
                    'is_assignment' => true,
                    'course' => [
                        'id' => $assignment->course->id,
                        'title' => $assignment->course->title
                    ]
                ]);
            }

            foreach ($submissions as $submission) {
                $data->push([
                    'id' => $submission->id,
                    'title' => $submission->assignment->title,
                    'type' => $submission->assignment->type,
                    'status' => 'received',
                    'submitted_at' => $submission->submitted_at,
                    'file_name' => $submission->file_name,
                    'is_assignment' => false,
                    'student' => [
                        'id' => $submission->user->id,
                        'name' => $submission->user->name,
                        'email' => $submission->user->email
                    ],
                    'course' => [
                        'id' => $submission->assignment->course->id,
                        'title' => $submission->assignment->course->title
                    ]
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $data->toArray()
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
            'file' => 'nullable|file|mimes:pdf,doc,docx,txt,zip,rar|max:10240', // 10MB max
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

            $assignment = Assignment::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'course_id' => $request->course_id,
                'student_id' => $user->id,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'status' => $status,
                'due_date' => $request->due_date,
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
