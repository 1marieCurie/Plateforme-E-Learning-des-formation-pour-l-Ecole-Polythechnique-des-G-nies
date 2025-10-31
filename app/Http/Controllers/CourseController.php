<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Formation;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * GET /api/courses/followed
     * Récupérer tous les cours accessibles à l'étudiant connecté
     */
    public function getFollowedCourses(Request $request)
    {
        try {
            $user = $request->user();
            // Récupérer toutes les formations où l'étudiant est inscrit
            $formations = $user->formations()->with('courses')->get();
            // Extraire tous les cours de ces formations
            $courses = $formations->pluck('courses')->flatten()->unique('id')->values();

            return response()->json($courses);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des cours suivis',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * GET /api/courses
     * Récupérer tous les cours actifs avec statistiques
     */
    public function index()
    {
        try {
            $courses = Course::with(['category', 'formation.enrollments'])
                            ->where('is_active', true)
                            ->orderBy('order_index')
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $courses->map(function ($course) {
                    // Calculer les statistiques réelles
                    $enrolledStudents = $course->formation ? $course->formation->enrollments()->count() : 0;
                    
                    // Calculer la progression moyenne depuis chapter_progress
                    $avgProgress = 0;
                    if ($enrolledStudents > 0 && $course->chapters()->count() > 0) {
                        $totalChapters = $course->chapters()->count();
                            $progressData = \DB::table('chapter_progresses')
                                ->join('chapters', 'chapter_progresses.chapter_id', '=', 'chapters.id')
                            ->where('chapters.course_id', $course->id)
                                ->where('chapter_progresses.is_read', true)
                                ->selectRaw('COUNT(DISTINCT chapter_progresses.user_id) as users_with_progress, COUNT(*) as completed_chapters')
                            ->first();
                        
                        if ($progressData && $progressData->users_with_progress > 0) {
                            $avgProgress = ($progressData->completed_chapters / ($totalChapters * $enrolledStudents)) * 100;
                        }
                    }
                    
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'image' => $course->image ? asset('storage/' . $course->image) : null,
                        'duration_minutes' => $course->duration_minutes,
                        'difficulty_level' => $course->difficulty_level,
                        'order_index' => $course->order_index,
                        'is_active' => $course->is_active,
                        'avgProgress' => round($avgProgress, 1),
                        'avgScore' => 0, // À implémenter si vous avez des scores
                        'views' => $course->view_count ?? 0,
                        'category' => $course->category ? [
                            'id' => $course->category->id,
                            'nom' => $course->category->nom
                        ] : null,
                        'formation' => $course->formation ? [
                            'id' => $course->formation->id,
                            'title' => $course->formation->title,
                            'enrolled_students' => $enrolledStudents
                        ] : null
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des cours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/courses/{course}/view
     * Incrémente le compteur de vues d'un cours et retourne la nouvelle valeur
     */
    public function incrementView(Request $request, Course $course)
    {
        try {
            // Incrément atomique pour éviter les conditions de course
            $course->increment('view_count');
            $course->refresh();

            return response()->json([
                'success' => true,
                'course_id' => $course->id,
                'view_count' => $course->view_count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => "Erreur lors de l'incrément des vues",
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/courses
     * Créer un nouveau cours (formateurs seulement)
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'formation_id' => 'required|exists:formations,id',
            'category_id' => 'required|exists:categories,id',
            'duration_minutes' => 'nullable|integer|min:1',
            'difficulty_level' => 'nullable|in:debutant,intermediaire,avance',
            'prerequisites' => 'nullable|array',
            'learning_objectives' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {
            $user = Auth::user();
            $formation = Formation::findOrFail($request->formation_id);

            // Vérifier que l'utilisateur est le créateur de la formation
            if ($formation->teacher_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à ajouter des cours à cette formation'
                ], 403);
            }

            // Calculer l'ordre du cours (dernier + 1)
            $lastOrder = Course::where('formation_id', $request->formation_id)->max('order_index') ?? 0;

            $courseData = [
                'title' => $request->title,
                'description' => $request->description,
                'formation_id' => $request->formation_id,
                'category_id' => $request->category_id,
                'duration_minutes' => $request->duration_minutes ?? 60,
                'difficulty_level' => $request->difficulty_level ?? 'debutant',
                'prerequisites' => $request->prerequisites,
                'learning_objectives' => $request->learning_objectives,
                'order_index' => $lastOrder + 1,
                'is_active' => true
            ];

            // Gérer l'upload de l'image
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('courses', 'public');
                $courseData['image'] = $imagePath;
            }

            $course = Course::create($courseData);

            // Mettre à jour les stats du formateur
            $teacherProfile = $formation->teacher->teacherProfile;
            if ($teacherProfile) {
                $teacherProfile->updateStats();
            }

            return response()->json([
                'success' => true,
                'message' => 'Cours créé avec succès',
                'data' => $course->load(['category', 'formation'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du cours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/formations/{formation_id}/courses
     * Récupérer les cours d'une formation
     */
    public function getFormationCourses($formation_id)
    {
        try {
            $formation = Formation::findOrFail($formation_id);
            $courses = $formation->courses()->with(['chapters'])->get();

            return response()->json([
                'success' => true,
                'formation' => [
                    'id' => $formation->id,
                    'title' => $formation->title,
                    'total_duration' => $formation->total_duration
                ],
                'data' => $courses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Formation non trouvée',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * GET /api/my-courses
     * Récupérer les cours du formateur connecté
     */
  /**
 * GET /api/my-courses
 * Récupérer les cours du formateur connecté avec toutes les données nécessaires
 */
public function myCourses(Request $request)
{
    try {
        $user = $request->user();
        
        // Debug
        \Log::info('User attempting to access my-courses:', [
            'user_id' => $user ? $user->id : 'null',
            'user_role' => $user ? $user->role : 'null'
        ]);
        
        // Vérifier que l'utilisateur est un formateur
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Cette route est réservée aux formateurs'], 403);
        }

        // Récupérer les cours des formations du formateur avec toutes les relations
        $courses = Course::with(['category', 'formation', 'chapters'])
                        ->whereHas('formation', function ($query) use ($user) {
                            $query->where('teacher_id', $user->id);
                        })
                        ->orderBy('created_at', 'desc')
                        ->get();
        
        \Log::info('Courses found:', ['count' => $courses->count()]);

        $coursesData = $courses->map(function ($course) {
            // Calculer le nombre d'étudiants inscrits à la formation du cours
            $studentsCount = $course->formation ? $course->formation->enrollments()->count() : 0;
            
            // Récupérer la liste des étudiants avec leurs détails via la formation
            $studentsList = $course->formation ? $course->formation->enrollments()
                ->with('user')
                ->get()
                ->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->user->id,
                        'name' => $enrollment->user->nom,  // Utiliser 'nom' au lieu de 'name'
                        'email' => $enrollment->user->email,
                        'tel' => $enrollment->user->tel,
                        'enrolled_at' => $enrollment->created_at,
                        'progress' => $enrollment->progress_percentage ?? 0
                    ];
                }) : collect();

            // Calculer la progression moyenne
            $avgProgress = $studentsList->avg('progress') ?? 0;

            return [
                'id' => $course->id,
                'title' => $course->title,
                'description' => $course->description,
                'image' => $course->image ? asset('storage/' . $course->image) : null,
                'duration_minutes' => $course->duration_minutes,
                'difficulty_level' => $course->difficulty_level,
                'order_index' => $course->order_index,
                'created_at' => $course->created_at,
                'updated_at' => $course->updated_at,
                // Données pour l'affichage
                'students' => $studentsCount,
                'enrolled_students' => $studentsCount,
                'avgProgress' => round($avgProgress, 1),
                'chapters_count' => $course->chapters()->count(),
                // Relations
                'category' => $course->category ? [
                    'id' => $course->category->id,
                    'nom' => $course->category->nom
                ] : null,
                'formation' => $course->formation ? [
                    'id' => $course->formation->id,
                    'title' => $course->formation->title
                ] : null,
                // Listes détaillées pour les dropdowns
                'studentsList' => $studentsList,
                'chapitres' => $course->chapters->map(function ($chapter) {
                    return [
                        'id' => $chapter->id,
                        'title' => $chapter->titre,
                        'order_index' => $chapter->id,
                        'duration_minutes' => 0,
                        'is_active' => true
                    ];
                })
            ];
        });

        return response()->json($coursesData);

    } catch (\Exception $e) {
        \Log::error('Error in myCourses:', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des cours',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Récupérer les cours d'une formation pour un étudiant inscrit
     */
    public function getFormationCoursesForStudent(Request $request, $formationId)
    {

        try {
            $user = $request->user();
            // Vérifier que l'étudiant est inscrit à cette formation (sans restriction de paiement)
            $enrollment = \App\Models\FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $formationId)
                ->first();

            if (!$enrollment) {
                return response()->json([
                    'error' => "Vous n'êtes pas inscrit à cette formation"
                ], 403);
            }

            // Récupérer la formation avec ses cours
            $formation = Formation::with([
                'courses' => function($query) {
                    $query->where('is_active', true)
                          ->orderBy('order_index')
                          ->with(['chapters:id,course_id,titre']);
                },
                'category:id,nom'
            ])->findOrFail($formationId);

            // Formatter les cours avec la vraie progression de l'étudiant
            $courses = $formation->courses->map(function($course) use ($user, $formation) {
                $totalChapters = $course->chapters->count();
                $readChapters = \App\Models\ChapterProgress::where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('is_read', true)
                    ->count();
                $progress = $totalChapters > 0 ? ($readChapters / $totalChapters) * 100 : 0;
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'image' => $course->image,
                    'formation_id' => $course->formation_id,
                    'order_index' => $course->order_index,
                    'duration_minutes' => $course->duration_minutes,
                    'chapters' => $course->chapters->map(function($chapter) {
                        return [
                            'id' => $chapter->id,
                            'course_id' => $chapter->course_id,
                            'title' => $chapter->titre
                        ];
                    }),
                    'chapters_count' => $totalChapters,
                    'progress' => $progress,
                    'is_completed' => $progress >= 100,
                    // Métadonnées supplémentaires
                    'formation_title' => $formation->title,
                    'category' => $formation->category->nom ?? 'Non catégorisé'
                ];
            });

            return response()->json($courses);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération des cours',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer la progression d'un cours pour un étudiant
     */
    public function markCourseProgress(Request $request, $courseId)
    {
        try {
            $request->validate([
                'progress_percentage' => 'required|numeric|between:0,100',
                'last_chapter' => 'nullable|string'
            ]);


            $user = $request->user();
            // Vérifier que l'étudiant a accès à ce cours via une formation (sans restriction de paiement)
            $course = \App\Models\Course::with('formation')->findOrFail($courseId);
            $enrollment = \App\Models\FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $course->formation_id)
                ->first();

            if (!$enrollment) {
                return response()->json([
                    'error' => "Vous n'avez pas accès à ce cours"
                ], 403);
            }

            // TODO: Créer/mettre à jour la progression dans une table course_progress
            // Pour l'instant, on retourne juste un succès
            return response()->json([
                'message' => 'Progression mise à jour',
                'course_id' => $courseId,
                'progress' => $request->progress_percentage
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la mise à jour de la progression',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer la progression détaillée d'un étudiant pour un cours
     */
    public function getCourseProgressForStudent(Request $request, $courseId)
    {
        try {
            $user = $request->user();
            // Vérifier l'accès au cours (sans restriction de paiement)
            $course = \App\Models\Course::with(['formation', 'chapters'])->findOrFail($courseId);
            $enrollment = \App\Models\FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $course->formation_id)
                ->first();

            if (!$enrollment) {
                return response()->json([
                    'error' => "Vous n'avez pas accès à ce cours"
                ], 403);
            }

            // Pour chaque chapitre, déterminer s'il est lu par l'étudiant
            $chapters = $course->chapters->map(function($chapter) use ($user) {
                $isRead = \App\Models\ChapterProgress::where('user_id', $user->id)
                    ->where('chapter_id', $chapter->id)
                    ->where('is_read', true)
                    ->exists();
                return [
                    'id' => $chapter->id,
                    'name' => $chapter->titre,
                    'progress' => $isRead ? 100 : 0
                ];
            });

            // Calculer la progression globale
            $totalChapters = $chapters->count();
            $completedChapters = $chapters->where('progress', 100)->count();
            $progressPercentage = $totalChapters > 0 ? ($completedChapters / $totalChapters) * 100 : 0;


            $progress = [
                'course_id' => $courseId,
                'progress_percentage' => $progressPercentage,
                'completed_chapters' => $completedChapters,
                'total_chapters' => $totalChapters,
                'last_accessed' => now()->subDays(rand(0, 7)),
                'chapters' => $chapters
            ];

            return response()->json($progress);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de la récupération de la progression',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /api/courses/{id}
     * Modifier un cours (formateur propriétaire seulement)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $course = Course::with(['formation', 'category', 'chapters'])->findOrFail($id);
            
            // Vérifier que l'utilisateur est le propriétaire de la formation ou un admin
            if ($user->role === 'formateur' && $course->formation->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier que vos propres cours'
                ], 403);
            }

            $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'formation_id' => 'nullable|exists:formations,id',
                'category_id' => 'nullable|exists:categories,id',
                'duration_minutes' => 'nullable|integer|min:1',
                'difficulty_level' => 'nullable|in:debutant,intermediaire,avance',
                'prerequisites' => 'nullable|array',
                'learning_objectives' => 'nullable|array',
                'is_active' => 'nullable|boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            // Si on change de formation, vérifier que l'utilisateur est propriétaire de la nouvelle formation
            if ($request->has('formation_id') && $request->formation_id != $course->formation_id) {
                $newFormation = Formation::findOrFail($request->formation_id);
                if ($user->role === 'formateur' && $newFormation->teacher_id !== $user->id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez pas déplacer un cours vers une formation qui ne vous appartient pas'
                    ], 403);
                }
            }

            // Gérer l'upload de l'image
            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($course->image && Storage::disk('public')->exists($course->image)) {
                    Storage::disk('public')->delete($course->image);
                }
                $imagePath = $request->file('image')->store('courses', 'public');
                $course->image = $imagePath;
            }

            // Mettre à jour les champs fournis
            $fieldsToUpdate = ['title', 'description', 'formation_id', 'category_id', 
                             'duration_minutes', 'difficulty_level', 'prerequisites', 
                             'learning_objectives', 'is_active'];
            
            foreach ($fieldsToUpdate as $field) {
                if ($request->has($field)) {
                    $course->$field = $request->$field;
                }
            }

            $course->save();

            return response()->json([
                'success' => true,
                'message' => 'Cours mis à jour avec succès',
                'data' => $course->load(['category', 'formation', 'chapters'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du cours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /api/courses/{id}
     * Supprimer un cours (formateur propriétaire seulement)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $course = Course::with(['formation', 'chapters'])->findOrFail($id);

            // Vérifier que l'utilisateur est le propriétaire de la formation ou un admin
            if ($user->role === 'formateur' && $course->formation->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez supprimer que vos propres cours'
                ], 403);
            }

            // Suppression forcée si paramètre 'force' présent
            $force = $request->input('force', false);

            // Vérifier s'il y a des étudiants inscrits à la formation de ce cours (suppression de la restriction de paiement)
            $enrolledStudents = $course->formation->enrollments()->count();

            if ($enrolledStudents > 0 && !$force) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer ce cours car des étudiants sont inscrits à la formation correspondante'
                ], 400);
            }

            // Supprimer les chapitres associés (vérifier les relations)
            foreach ($course->chapters as $chapter) {
                // Ici on pourrait ajouter la suppression des ressources des chapitres si nécessaire
                $chapter->delete();
            }

            // Supprimer l'image si elle existe
            if ($course->image && Storage::disk('public')->exists($course->image)) {
                Storage::disk('public')->delete($course->image);
            }

            $course->delete();

            // Mettre à jour les stats du formateur
            $teacherProfile = $course->formation->teacher->teacherProfile;
            if ($teacherProfile) {
                $teacherProfile->updateStats();
            }

            return response()->json([
                'success' => true,
                'message' => 'Cours supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du cours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
