<?php

namespace App\Http\Controllers;

use App\Models\TeacherFeedback;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TeacherFeedbackController extends Controller
{
    /**
     * GET /api/my-teacher-feedbacks
     * Récupérer les feedbacks donnés par le formateur connecté
     */
    public function getMyFeedbacks(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Accès réservé aux formateurs'], 403);
        }

        $query = TeacherFeedback::where('teacher_id', $user->id)
            ->with(['student:id,nom,email', 'formation:id,title']);

        // Filtres optionnels
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }

        if ($request->has('feedback_type')) {
            $query->where('feedback_type', $request->feedback_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($feedbacks);
    }

    /**
     * GET /api/students/{studentId}/feedbacks
     * Récupérer les feedbacks reçus par un étudiant (formateur ou admin)
     */
    public function getStudentFeedbacks($studentId, Request $request)
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès réservé aux formateurs et admins'], 403);
        }

        $student = User::where('role', 'etudiant')->findOrFail($studentId);

        $query = TeacherFeedback::where('student_id', $studentId)
            ->with(['teacher:id,nom', 'formation:id,title']);

        // Si c'est un formateur, ne voir que ses propres feedbacks
        if ($user->role === 'formateur') {
            $query->where('teacher_id', $user->id);
        }

        // Filtres optionnels
        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }

        if ($request->has('feedback_type')) {
            $query->where('feedback_type', $request->feedback_type);
        }

        $feedbacks = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($feedbacks);
    }

    /**
     * POST /api/teacher-feedbacks
     * Créer un nouveau feedback formateur
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Accès réservé aux formateurs'], 403);
        }

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'formation_id' => 'required|exists:formations,id',
            'rating' => 'required|numeric|between:1,5',
            'title' => 'nullable|string|max:255',
            'message' => 'required|string|max:2000',
            'participation_rating' => 'nullable|integer|between:1,5',
            'progress_rating' => 'nullable|integer|between:1,5',
            'commitment_rating' => 'nullable|integer|between:1,5',
            'technical_skills_rating' => 'nullable|integer|between:1,5',
            'recommendations' => 'nullable|string|max:1000',
            'strengths' => 'nullable|string|max:1000',
            'areas_for_improvement' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
            'feedback_type' => 'required|in:progress,encouragement,warning,recommendation,milestone'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Vérifier que l'étudiant existe et a le bon rôle
        $student = User::where('id', $request->student_id)
            ->where('role', 'etudiant')
            ->firstOrFail();

        // Vérifier que le formateur a accès à cette formation
        $formation = Formation::where('id', $request->formation_id)
            ->where('teacher_id', $user->id)
            ->firstOrFail();

        // Vérifier que l'étudiant est inscrit à cette formation (sans restriction de paiement)
        $isEnrolled = $formation->students()
            ->where('user_id', $student->id)
            ->exists();

        if (!$isEnrolled) {
            return response()->json(['error' => 'L\'étudiant n\'est pas inscrit à cette formation'], 403);
        }

        $feedback = TeacherFeedback::create([
            'teacher_id' => $user->id,
            'student_id' => $request->student_id,
            'formation_id' => $request->formation_id,
            'rating' => $request->rating,
            'title' => $request->title,
            'message' => $request->message,
            'participation_rating' => $request->participation_rating,
            'progress_rating' => $request->progress_rating,
            'commitment_rating' => $request->commitment_rating,
            'technical_skills_rating' => $request->technical_skills_rating,
            'recommendations' => $request->recommendations,
            'strengths' => $request->strengths,
            'areas_for_improvement' => $request->areas_for_improvement,
            'is_private' => $request->boolean('is_private', true),
            'feedback_type' => $request->feedback_type,
            'status' => 'sent'
        ]);

        return response()->json([
            'message' => 'Feedback créé avec succès',
            'feedback' => $feedback->load(['student:id,nom', 'formation:id,title'])
        ], 201);
    }

    /**
     * PUT /api/teacher-feedbacks/{id}
     * Modifier un feedback formateur
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $feedback = TeacherFeedback::findOrFail($id);

        // Vérifier les permissions
        if ($user->role === 'formateur' && $feedback->teacher_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez modifier que vos propres feedbacks'], 403);
        }

        if (!in_array($user->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Permissions insuffisantes'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|numeric|between:1,5',
            'title' => 'nullable|string|max:255',
            'message' => 'sometimes|string|max:2000',
            'participation_rating' => 'nullable|integer|between:1,5',
            'progress_rating' => 'nullable|integer|between:1,5',
            'commitment_rating' => 'nullable|integer|between:1,5',
            'technical_skills_rating' => 'nullable|integer|between:1,5',
            'recommendations' => 'nullable|string|max:1000',
            'strengths' => 'nullable|string|max:1000',
            'areas_for_improvement' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
            'feedback_type' => 'sometimes|in:progress,encouragement,warning,recommendation,milestone'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $feedback->update($request->only([
            'rating', 'title', 'message', 'participation_rating',
            'progress_rating', 'commitment_rating', 'technical_skills_rating',
            'recommendations', 'strengths', 'areas_for_improvement',
            'is_private', 'feedback_type'
        ]));

        return response()->json([
            'message' => 'Feedback mis à jour avec succès',
            'feedback' => $feedback->load(['student:id,nom', 'formation:id,title'])
        ]);
    }

    /**
     * POST /api/teacher-feedbacks/{id}/read
     * Marquer un feedback comme lu (étudiant)
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        $feedback = TeacherFeedback::findOrFail($id);

        // Vérifier que c'est l'étudiant concerné
        if ($feedback->student_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez lire que vos propres feedbacks'], 403);
        }

        if ($feedback->status !== 'read') {
            $feedback->update([
                'status' => 'read',
                'read_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Feedback marqué comme lu',
            'feedback' => $feedback
        ]);
    }

    /**
     * GET /api/teacher-feedbacks/stats
     * Statistiques des feedbacks formateur
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès réservé aux formateurs et admins'], 403);
        }

        $query = TeacherFeedback::query();

        // Filtrer par formateur si c'est un formateur
        if ($user->role === 'formateur') {
            $query->where('teacher_id', $user->id);
        }

        // Filtres optionnels
        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('formation_id')) {
            $query->where('formation_id', $request->formation_id);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        $stats = [
            'total_feedbacks' => $query->count(),
            'average_rating' => $query->avg('rating'),
            'type_distribution' => $query->selectRaw('feedback_type, COUNT(*) as count')
                ->groupBy('feedback_type')
                ->pluck('count', 'feedback_type'),
            'status_distribution' => $query->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'private_feedbacks' => $query->where('is_private', true)->count(),
            'recent_feedbacks' => $query->where('created_at', '>=', now()->subDays(7))->count()
        ];

        return response()->json($stats);
    }

    /**
     * POST /api/teacher-feedbacks/bulk
     * Créer plusieurs feedbacks en lot
     */
    public function createBulk(Request $request)
    {
        $user = Auth::user();
        
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Accès réservé aux formateurs'], 403);
        }

        $validator = Validator::make($request->all(), [
            'feedbacks' => 'required|array|min:1|max:50',
            'feedbacks.*.student_id' => 'required|exists:users,id',
            'feedbacks.*.formation_id' => 'required|exists:formations,id',
            'feedbacks.*.rating' => 'required|numeric|between:1,5',
            'feedbacks.*.message' => 'required|string|max:2000',
            'feedbacks.*.feedback_type' => 'required|in:progress,encouragement,warning,recommendation,milestone'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $createdFeedbacks = [];
        $errors = [];

        foreach ($request->feedbacks as $index => $feedbackData) {
            try {
                // Vérifier les permissions pour chaque feedback
                $formation = Formation::where('id', $feedbackData['formation_id'])
                    ->where('teacher_id', $user->id)
                    ->first();

                if (!$formation) {
                    $errors[] = "Feedback {$index}: Vous n'avez pas accès à cette formation";
                    continue;
                }

                $feedback = TeacherFeedback::create([
                    'teacher_id' => $user->id,
                    'student_id' => $feedbackData['student_id'],
                    'formation_id' => $feedbackData['formation_id'],
                    'rating' => $feedbackData['rating'],
                    'message' => $feedbackData['message'],
                    'feedback_type' => $feedbackData['feedback_type'],
                    'is_private' => $feedbackData['is_private'] ?? true,
                    'status' => 'sent'
                ]);

                $createdFeedbacks[] = $feedback;
            } catch (\Exception $e) {
                $errors[] = "Feedback {$index}: " . $e->getMessage();
            }
        }

        return response()->json([
            'message' => count($createdFeedbacks) . ' feedbacks créés avec succès',
            'created' => count($createdFeedbacks),
            'errors' => $errors,
            'feedbacks' => $createdFeedbacks
        ]);
    }

    /**
     * DELETE /api/teacher-feedbacks/{id}
     * Supprimer un feedback
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $feedback = TeacherFeedback::findOrFail($id);

        // Vérifier les permissions
        if ($user->role === 'formateur' && $feedback->teacher_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez supprimer que vos propres feedbacks'], 403);
        }

        if (!in_array($user->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Permissions insuffisantes'], 403);
        }

        $feedback->delete();

        return response()->json(['message' => 'Feedback supprimé avec succès']);
    }
}
