<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\CategoryProgress;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CategoryProgressController extends Controller
{
    /**
     * Mettre à jour la progression d'une formation/catégorie
     */
    public function updateProgress($categoryId)
    {
        try {
            $user = Auth::user();
            
            // Récupérer tous les cours de cette catégorie
            $coursesInCategory = Course::where('category_id', $categoryId)->pluck('id');
            
            if ($coursesInCategory->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun cours trouvé dans cette formation'
                ], 404);
            }

            // Récupérer les inscriptions de l'utilisateur dans ces cours
            $enrollments = DB::table('course_student')
                ->where('user_id', $user->id)
                ->whereIn('course_id', $coursesInCategory)
                ->get();

            $totalCourses = $coursesInCategory->count();
            $enrolledCourses = $enrollments->count();
            $completedCourses = $enrollments->where('progress', 100)->count();
            
            // Calculer la progression moyenne
            $averageProgress= $enrolledCourses > 0
                ? $enrollments ->avg('progress')
                : 0;

            // Mettre à jour ou créer la progression de la catégorie
            $categoryProgress = CategoryProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'category_id' => $categoryId
                ],
                [
                    'total_courses' => $totalCourses,
                    'completed_courses' => $completedCourses,
                    'progress_percentage' => round($averageProgress, 2),
                    'last_updated_at' => now()
                ]
            );

            return response()->json([
                'success' => true,
                'data' => $categoryProgress,
                'message' => 'Progression de la formation mise à jour'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la formation',
                'error' => $e->getMessage() // Ajout du message d'erreur pour plus de détails
            ], 500);
        }
    }
}
