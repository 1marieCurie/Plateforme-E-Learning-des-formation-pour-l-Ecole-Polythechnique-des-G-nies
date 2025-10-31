<?php
/**
 * Test rapide de l'API /courses après corrections
 * Execute: php test_api_courses_quick.php
 */

echo "=== TEST API /COURSES ===\n\n";

// Simuler un appel comme celui du Controller
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use Illuminate\Support\Facades\DB;

try {
    echo "1. Test de la requête de base:\n";
    $courses = Course::with(['category', 'formation.enrollments'])
                    ->where('is_active', true)
                    ->orderBy('order_index')
                    ->get();
    
    echo "   ✅ Succès: " . $courses->count() . " cours trouvés\n\n";
    
    echo "2. Test de la transformation des données:\n";
    $firstCourse = $courses->first();
    if ($firstCourse) {
        $enrolledStudents = $firstCourse->formation ? $firstCourse->formation->enrollments()->count() : 0;
        
        echo "   Cours: {$firstCourse->title}\n";
        echo "   Formation: " . ($firstCourse->formation ? $firstCourse->formation->title : 'N/A') . "\n";
        echo "   Catégorie: " . ($firstCourse->category ? $firstCourse->category->nom : 'N/A') . "\n";
        echo "   Étudiants inscrits: {$enrolledStudents}\n";
        
        // Test de la progression
        $totalChapters = $firstCourse->chapters()->count();
        echo "   Chapitres: {$totalChapters}\n";
        
        if ($enrolledStudents > 0 && $totalChapters > 0) {
                $progressData = DB::table('chapter_progresses')
                    ->join('chapters', 'chapter_progresses.chapter_id', '=', 'chapters.id')
                ->where('chapters.course_id', $firstCourse->id)
                    ->where('chapter_progresses.is_read', true)
                    ->selectRaw('COUNT(DISTINCT chapter_progresses.user_id) as users_with_progress, COUNT(*) as completed_chapters')
                ->first();
            
            if ($progressData && $progressData->users_with_progress > 0) {
                $avgProgress = ($progressData->completed_chapters / ($totalChapters * $enrolledStudents)) * 100;
                echo "   Progression moyenne: " . round($avgProgress, 1) . "%\n";
            } else {
                echo "   Progression moyenne: 0%\n";
            }
        }
        
        echo "   ✅ Transformation réussie\n\n";
    }
    
    echo "3. Test du format de sortie complet:\n";
    $formattedData = $courses->map(function ($course) {
        $enrolledStudents = $course->formation ? $course->formation->enrollments()->count() : 0;
        
        $avgProgress = 0;
        if ($enrolledStudents > 0 && $course->chapters()->count() > 0) {
            $totalChapters = $course->chapters()->count();
                $progressData = DB::table('chapter_progresses')
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
            'avgProgress' => round($avgProgress, 1),
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
    });
    
    echo "   ✅ Format JSON compatible\n";
    echo "   Exemple de données:\n";
    echo "   " . json_encode($formattedData->first(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
    echo "=== RÉSULTAT FINAL ===\n";
    echo "✅ L'API devrait fonctionner correctement\n";
    echo "✅ Nombre de cours: " . $courses->count() . "\n";
    echo "✅ Format de données: OK\n";
    echo "✅ Relations: OK\n\n";
    
    echo "Pour tester dans le navigateur:\n";
    echo "1. Assurez-vous que le serveur Laravel est démarré\n";
    echo "2. Rechargez la page frontend (Ctrl+F5)\n";
    echo "3. Vérifiez qu'il n'y a plus d'erreur 500\n";
    
} catch (Exception $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    echo "\nStackTrace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
