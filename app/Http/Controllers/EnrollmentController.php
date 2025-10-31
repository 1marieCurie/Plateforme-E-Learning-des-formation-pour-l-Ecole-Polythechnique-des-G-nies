<?php

namespace App\Http\Controllers;

use App\Models\FormationEnrollment;
use App\Models\Formation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnrollmentController extends Controller
{
    /**
     * Récupérer les inscriptions de l'utilisateur connecté avec détails des formations
     */
    public function getMyEnrollments(Request $request)
    {
        try {
            $user = $request->user();
            
            // Log pour debug
            Log::info('Getting enrollments for user: ' . $user->id);
            
            $enrollments = FormationEnrollment::where('user_id', $user->id)
                ->with([
                    'formation' => function($query) {
                        $query->with([
                            'category:id,nom',
                            'teacher' => function($q) {
                                $q->select('users.id', 'users.nom as name');
                            },
                            'courses' => function($q) {
                                $q->select('id', 'formation_id', 'title', 'description', 'image', 'duration_minutes')
                                  ->where('is_active', true)
                                  ->orderBy('order_index');
                            }
                        ]);
                    }
                ])
                ->orderBy('enrolled_at', 'desc')
                ->get();

            Log::info('Enrollments found: ' . $enrollments->count());

            $formattedEnrollments = $enrollments->map(function($enrollment) {
                // Vérifier que la formation existe
                if (!$enrollment->formation) {
                    Log::warning('Formation not found for enrollment: ' . $enrollment->id);
                    return null;
                }

                return [
                    'id' => $enrollment->id,
                    'formation_id' => $enrollment->formation_id,
                    'enrolled_at' => $enrollment->enrolled_at,
                    'progress_percentage' => $enrollment->progress_percentage ?? 0,
                    'completed_at' => $enrollment->completed_at,
                    // 'payment_status' => $enrollment->payment_status, // Suppression du champ
                    'updated_at' => $enrollment->updated_at,
                    'formation' => [
                        'id' => $enrollment->formation->id,
                        'title' => $enrollment->formation->title,
                        'description' => $enrollment->formation->description,
                        'image' => $enrollment->formation->image,
                        'category' => $enrollment->formation->category ? [
                            'id' => $enrollment->formation->category->id,
                            'nom' => $enrollment->formation->category->nom
                        ] : null,
                        'teacher' => $enrollment->formation->teacher ? [
                            'id' => $enrollment->formation->teacher->id,
                            'name' => $enrollment->formation->teacher->name ?? $enrollment->formation->teacher->nom
                        ] : null,
                        'courses' => $enrollment->formation->courses ? $enrollment->formation->courses->map(function($course) {
                            return [
                                'id' => $course->id,
                                'title' => $course->title,
                                'description' => $course->description,
                                'image' => $course->image,
                                'duration_minutes' => $course->duration_minutes ?? 60
                            ];
                        }) : []
                    ]
                ];
            })->filter(); // Filtrer les valeurs null

            return response()->json($formattedEnrollments->values());
            
        } catch (\Exception $e) {
            Log::error('Error in getMyEnrollments: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Erreur lors de la récupération des inscriptions',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * S'inscrire à une formation
     */
    public function enrollToFormation(Request $request)
    {
        try {
            $request->validate([
                'formation_id' => 'required|exists:formations,id'
            ]);

            $user = $request->user();
            $formationId = $request->formation_id;

            // Vérifier si déjà inscrit
            $existingEnrollment = FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $formationId)
                ->first();

            if ($existingEnrollment) {
                return response()->json([
                    'error' => 'Vous êtes déjà inscrit à cette formation'
                ], 422);
            }

            $formation = Formation::findOrFail($formationId);

            // Créer l'inscription
            $enrollment = FormationEnrollment::create([
                'user_id' => $user->id,
                'formation_id' => $formationId,
                'enrolled_at' => now(),
                'progress_percentage' => 0,
                'amount_paid' => $formation->price ?? 0
                // Suppression du champ payment_status
            ]);

            // Incrémenter le compteur d'inscrits
            $formation->increment('total_enrolled');

            // Charger les relations pour la réponse
            $enrollment->load([
                'formation' => function($query) {
                    $query->with(['category:id,nom', 'teacher:id,nom', 'courses']);
                }
            ]);

            return response()->json([
                'message' => 'Inscription réussie',
                'enrollment' => $enrollment
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error in enrollToFormation: ' . $e->getMessage());
            
            return response()->json([
                'error' => "Erreur lors de l'inscription",
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Se désinscrire d'une formation
     */
    public function unenrollFromFormation(Request $request, $enrollmentId)
    {
        try {
            $user = $request->user();
            
            $enrollment = FormationEnrollment::where('id', $enrollmentId)
                ->where('user_id', $user->id)
                ->with('formation')
                ->firstOrFail();

            // Récupérer la formation et ses cours
            $formation = $enrollment->formation;
            $userId = $user->id;

            if ($formation) {
                $formation->decrement('total_enrolled');

                // Récupérer tous les cours de la formation
                $courseIds = $formation->courses()->pluck('id')->toArray();

                // Supprimer les progressions de chapitres liées à ces cours pour cet utilisateur
                \App\Models\ChapterProgress::where('user_id', $userId)
                    ->whereIn('course_id', $courseIds)
                    ->delete();

                // Supprimer les progressions de cours pour cet utilisateur
                if (\Schema::hasTable('course_progress')) {
                    \DB::table('course_progress')
                        ->where('user_id', $userId)
                        ->whereIn('course_id', $courseIds)
                        ->delete();
                }
            }

            // Supprimer l'inscription à la formation
            $enrollment->delete();

            return response()->json([
                'message' => 'Désinscription réussie, toutes les données liées à cette formation ont été supprimées.'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in unenrollFromFormation: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Erreur lors de la désinscription',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour la progression d'une formation
     */
    public function updateProgress(Request $request, $enrollmentId)
    {
        try {
            $request->validate([
                'progress_percentage' => 'required|numeric|between:0,100'
            ]);

            $user = $request->user();
            
            $enrollment = FormationEnrollment::where('id', $enrollmentId)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $enrollment->update([
                'progress_percentage' => $request->progress_percentage,
                'completed_at' => $request->progress_percentage == 100 ? now() : null
            ]);

            return response()->json([
                'message' => 'Progression mise à jour',
                'enrollment' => $enrollment
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in updateProgress: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Erreur lors de la mise à jour de la progression',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}