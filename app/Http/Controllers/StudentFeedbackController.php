<?php

namespace App\Http\Controllers;

use App\Models\StudentFeedback;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StudentFeedbackController extends Controller
{
    /**
     * GET /api/my-student-feedbacks
     * Récupérer les feedbacks donnés par l'étudiant connecté
     */
    public function getMyFeedbacks(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Accès réservé aux étudiants'], 403);
        }

        $query = StudentFeedback::where('student_id', $user->id)
            ->with(['teacher:id,nom,email', 'course:id,title']);

        // Filtres optionnels
        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('rating_min')) {
            $query->where('rating', '>=', $request->rating_min);
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($feedbacks);
    }

    /**
     * GET /api/courses/{courseId}/feedbacks
     * Récupérer les feedbacks publics d'un cours
     */
    public function getCourseFeedbacks($courseId, Request $request)
    {
        $query = StudentFeedback::where('course_id', $courseId)
            ->where('is_public', true)
            ->where('status', 'approved')
            ->with(['student:id,nom', 'teacher:id,nom']);

        // Si l'utilisateur est anonyme, masquer les noms
        if ($request->has('anonymous') && $request->anonymous == 'true') {
            $query->where('is_anonymous', true);
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($feedbacks);
    }

    /**
     * GET /api/teachers/{teacherId}/feedbacks
     * Récupérer les feedbacks publics d'un formateur
     */
    public function getTeacherFeedbacks($teacherId, Request $request)
    {
        $user = User::findOrFail($teacherId);
        
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Utilisateur non formateur'], 404);
        }

        $query = StudentFeedback::where('teacher_id', $teacherId)
            ->where('is_public', true)
            ->where('status', 'approved')
            ->with(['student:id,nom', 'course:id,title']);

        $feedbacks = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($feedbacks);
    }

    /**
     * POST /api/student-feedbacks
     * Créer un nouveau feedback étudiant
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Accès réservé aux étudiants'], 403);
        }

        $validator = Validator::make($request->all(), [
            'teacher_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
            'rating' => 'required|numeric|between:1,5',
            'title' => 'nullable|string|max:255',
            'message' => 'required|string|max:2000',
            'content_quality_rating' => 'nullable|integer|between:1,5',
            'teaching_method_rating' => 'nullable|integer|between:1,5',
            'difficulty_level_rating' => 'nullable|integer|between:1,5',
            'support_rating' => 'nullable|integer|between:1,5',
            'suggestions' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
            'is_public' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Vérifier que l'étudiant a accès au cours via la formation (sans restriction de paiement)
        $course = Course::findOrFail($request->course_id);
        $hasAccess = $user->formations()
            ->where('formations.id', $course->formation_id)
            ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'Vous n\'avez pas accès à ce cours'], 403);
        }

        // Vérifier qu'un feedback n'existe pas déjà pour ce cours
        $existingFeedback = StudentFeedback::where('student_id', $user->id)
            ->where('course_id', $request->course_id)
            ->first();

        if ($existingFeedback) {
            return response()->json(['error' => 'Vous avez déjà donné un feedback pour ce cours'], 409);
        }

        $feedback = StudentFeedback::create([
            'student_id' => $user->id,
            'teacher_id' => $request->teacher_id,
            'course_id' => $request->course_id,
            'rating' => $request->rating,
            'title' => $request->title,
            'message' => $request->message,
            'content_quality_rating' => $request->content_quality_rating,
            'teaching_method_rating' => $request->teaching_method_rating,
            'difficulty_level_rating' => $request->difficulty_level_rating,
            'support_rating' => $request->support_rating,
            'suggestions' => $request->suggestions,
            'is_anonymous' => $request->boolean('is_anonymous', false),
            'is_public' => $request->boolean('is_public', false),
            'status' => 'approved' // Pas de modération par défaut
        ]);

        return response()->json([
            'message' => 'Feedback créé avec succès',
            'feedback' => $feedback->load(['teacher:id,nom', 'course:id,title'])
        ], 201);
    }

    /**
     * PUT /api/student-feedbacks/{id}
     * Modifier un feedback étudiant
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $feedback = StudentFeedback::findOrFail($id);

        // Vérifier les permissions
        if ($user->role === 'etudiant' && $feedback->student_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez modifier que vos propres feedbacks'], 403);
        }

        if (!in_array($user->role, ['etudiant', 'admin'])) {
            return response()->json(['error' => 'Permissions insuffisantes'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|numeric|between:1,5',
            'title' => 'nullable|string|max:255',
            'message' => 'sometimes|string|max:2000',
            'content_quality_rating' => 'nullable|integer|between:1,5',
            'teaching_method_rating' => 'nullable|integer|between:1,5',
            'difficulty_level_rating' => 'nullable|integer|between:1,5',
            'support_rating' => 'nullable|integer|between:1,5',
            'suggestions' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
            'is_public' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $feedback->update($request->only([
            'rating', 'title', 'message', 'content_quality_rating',
            'teaching_method_rating', 'difficulty_level_rating', 'support_rating',
            'suggestions', 'is_anonymous', 'is_public'
        ]));

        return response()->json([
            'message' => 'Feedback mis à jour avec succès',
            'feedback' => $feedback->load(['teacher:id,nom', 'course:id,title'])
        ]);
    }

    /**
     * GET /api/courses/{courseId}/my-feedback
     * Récupérer mon feedback pour un cours spécifique
     */
    public function getMyCourseFeedback($courseId)
    {
        $user = Auth::user();
        
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Accès réservé aux étudiants'], 403);
        }

        $feedback = StudentFeedback::where('student_id', $user->id)
            ->where('course_id', $courseId)
            ->with(['teacher:id,nom', 'course:id,title'])
            ->first();

        if (!$feedback) {
            return response()->json(['message' => 'Aucun feedback trouvé'], 404);
        }

        return response()->json(['feedback' => $feedback]);
    }

    /**
     * GET /api/student-feedbacks/stats
     * Statistiques des feedbacks étudiants
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['admin', 'super_admin', 'formateur'])) {
            return response()->json(['error' => 'Accès réservé aux admins et formateurs'], 403);
        }

        // Construire une requête de base et cloner pour chaque métrique pour éviter les effets de bord
        $base = StudentFeedback::query();

        // Filtrer par formateur si c'est un formateur
        if ($user->role === 'formateur') {
            $base->where('teacher_id', $user->id);
        }

        // Filtres optionnels
        if ($request->has('teacher_id')) {
            $base->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('course_id')) {
            $base->where('course_id', $request->course_id);
        }

        $stats = [
            'total_feedbacks' => (clone $base)->count(),
            'average_rating' => (clone $base)->avg('rating'),
            'rating_distribution' => (clone $base)->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->pluck('count', 'rating'),
            'public_feedbacks' => (clone $base)->where('is_public', true)->count(),
            'anonymous_feedbacks' => (clone $base)->where('is_anonymous', true)->count(),
            'pending_moderation' => (clone $base)->where('status', 'pending')->count()
        ];

        return response()->json($stats);
    }

    /**
     * POST /api/student-feedbacks/{id}/moderate
     * Modérer un feedback (admin seulement)
     */
    public function moderate(Request $request, $id)
    {
        $user = Auth::user();
        
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Accès réservé aux administrateurs'], 403);
        }

        $feedback = StudentFeedback::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'admin_response' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $feedback->update([
            'status' => $request->status,
            'admin_response' => $request->admin_response
        ]);

        return response()->json([
            'message' => 'Feedback modéré avec succès',
            'feedback' => $feedback
        ]);
    }

    /**
     * DELETE /api/student-feedbacks/{id}
     * Supprimer un feedback
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $feedback = StudentFeedback::findOrFail($id);

        // Vérifier les permissions
        if ($user->role === 'etudiant' && $feedback->student_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez supprimer que vos propres feedbacks'], 403);
        }

        if (!in_array($user->role, ['etudiant', 'admin'])) {
            return response()->json(['error' => 'Permissions insuffisantes'], 403);
        }

        $feedback->delete();

        return response()->json(['message' => 'Feedback supprimé avec succès']);
    }
}
