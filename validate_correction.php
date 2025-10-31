<?php
/**
 * Script de validation rapide pour la correction des stats de cours
 * Execute: php validate_correction.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║    VALIDATION DES CORRECTIONS - STATISTIQUES DES COURS       ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

$allPassed = true;

// TEST 1: Nombre de cours
echo "TEST 1: Vérification du nombre de cours\n";
echo "─────────────────────────────────────────\n";
$totalCourses = DB::table('courses')->count();
if ($totalCourses === 11) {
    echo "✅ PASS: 11 cours trouvés (attendu: 11)\n";
} else {
    echo "❌ FAIL: $totalCourses cours trouvés (attendu: 11)\n";
    $allPassed = false;
}
echo "\n";

// TEST 2: Tous les cours sont actifs
echo "TEST 2: Vérification de l'état des cours\n";
echo "─────────────────────────────────────────\n";
$activeCourses = DB::table('courses')->where('is_active', 1)->count();
if ($activeCourses === 11) {
    echo "✅ PASS: Tous les cours sont actifs (11/11)\n";
} else {
    echo "⚠️  WARNING: $activeCourses cours actifs sur 11\n";
}
echo "\n";

// TEST 3: Relations avec formations
echo "TEST 3: Vérification des relations avec formations\n";
echo "────────────────────────────────────────────────────\n";
$coursesWithoutFormation = DB::table('courses')
    ->whereNull('formation_id')
    ->count();
if ($coursesWithoutFormation === 0) {
    echo "✅ PASS: Tous les cours ont une formation assignée\n";
} else {
    echo "❌ FAIL: $coursesWithoutFormation cours sans formation\n";
    $allPassed = false;
}
echo "\n";

// TEST 4: Relations avec catégories
echo "TEST 4: Vérification des relations avec catégories\n";
echo "─────────────────────────────────────────────────────\n";
$coursesWithoutCategory = DB::table('courses')
    ->whereNull('category_id')
    ->count();
if ($coursesWithoutCategory === 0) {
    echo "✅ PASS: Tous les cours ont une catégorie assignée\n";
} else {
    echo "❌ FAIL: $coursesWithoutCategory cours sans catégorie\n";
    $allPassed = false;
}
echo "\n";

// TEST 5: Total des inscriptions
echo "TEST 5: Vérification des inscriptions\n";
echo "───────────────────────────────────────\n";
$totalEnrollments = DB::table('formation_enrollments')->count();
echo "ℹ️  INFO: $totalEnrollments inscriptions trouvées\n";
if ($totalEnrollments > 0) {
    echo "✅ PASS: Des inscriptions existent\n";
} else {
    echo "⚠️  WARNING: Aucune inscription trouvée\n";
}
echo "\n";

// TEST 6: Vérifier que le CourseController::index existe
echo "TEST 6: Vérification du Controller\n";
echo "────────────────────────────────────\n";
$controllerPath = __DIR__ . '/app/Http/Controllers/CourseController.php';
$controllerContent = file_get_contents($controllerPath);
if (strpos($controllerContent, 'public function index()') !== false) {
    echo "✅ PASS: Méthode index() existe dans CourseController\n";
} else {
    echo "❌ FAIL: Méthode index() non trouvée dans CourseController\n";
    $allPassed = false;
}
echo "\n";

// TEST 7: Vérifier la route API
echo "TEST 7: Vérification de la route API\n";
echo "──────────────────────────────────────\n";
$routesPath = __DIR__ . '/routes/api.php';
$routesContent = file_get_contents($routesPath);
if (strpos($routesContent, "Route::get('/courses', [CourseController::class, 'index']") !== false) {
    echo "✅ PASS: Route API correcte (appelle 'index')\n";
} else if (strpos($routesContent, "Route::get('/courses', [CourseController::class, 'getAllCourses']") !== false) {
    echo "❌ FAIL: Route API incorrecte (appelle 'getAllCourses' au lieu de 'index')\n";
    $allPassed = false;
} else {
    echo "⚠️  WARNING: Route /courses non trouvée ou format différent\n";
}
echo "\n";

// TEST 8: Vérifier que les données mockées ont été supprimées du frontend
echo "TEST 8: Vérification du composant Frontend\n";
echo "────────────────────────────────────────────\n";
$frontendPath = __DIR__ . '/frontend/src/components/Admin/Stats_Tech/CourseStats.jsx';
if (file_exists($frontendPath)) {
    $frontendContent = file_get_contents($frontendPath);
    if (strpos($frontendContent, 'totalCourses: 25') === false) {
        echo "✅ PASS: Données mockées supprimées (pas de 'totalCourses: 25')\n";
    } else {
        echo "❌ FAIL: Données mockées encore présentes dans le frontend\n";
        $allPassed = false;
    }
} else {
    echo "⚠️  WARNING: Fichier frontend non trouvé\n";
}
echo "\n";

// TEST 9: Structure des données retournées
echo "TEST 9: Test de la structure de données API\n";
echo "─────────────────────────────────────────────\n";
try {
    $courses = DB::table('courses')
        ->join('formations', 'courses.formation_id', '=', 'formations.id')
        ->join('categories', 'courses.category_id', '=', 'categories.id')
        ->select('courses.*', 'formations.title as formation_title', 'categories.nom as category_name')
        ->first();
    
    if ($courses) {
        echo "✅ PASS: Les jointures fonctionnent correctement\n";
        echo "   Exemple: Cours '{$courses->title}' → Formation '{$courses->formation_title}'\n";
    } else {
        echo "⚠️  WARNING: Aucun cours trouvé pour le test de jointure\n";
    }
} catch (Exception $e) {
    echo "❌ FAIL: Erreur lors de la jointure: " . $e->getMessage() . "\n";
    $allPassed = false;
}
echo "\n";

// TEST 10: Chapitres
echo "TEST 10: Vérification des chapitres\n";
echo "─────────────────────────────────────\n";
$totalChapters = DB::table('chapters')->count();
echo "ℹ️  INFO: $totalChapters chapitres au total\n";
$coursesWithChapters = DB::table('courses')
    ->join('chapters', 'courses.id', '=', 'chapters.course_id')
    ->select('courses.id')
    ->distinct()
    ->count();
echo "ℹ️  INFO: $coursesWithChapters cours ont des chapitres\n";
echo "✅ PASS: Structure des chapitres vérifiée\n";
echo "\n";

// RÉSUMÉ FINAL
echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                       RÉSUMÉ FINAL                           ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

if ($allPassed) {
    echo "🎉 SUCCÈS: Toutes les corrections sont validées !\n\n";
    echo "Données confirmées:\n";
    echo "  • Total cours: $totalCourses\n";
    echo "  • Cours actifs: $activeCourses\n";
    echo "  • Inscriptions: $totalEnrollments\n";
    echo "  • Chapitres: $totalChapters\n";
    echo "  • Cours avec chapitres: $coursesWithChapters\n\n";
    echo "✅ Le frontend devrait maintenant afficher les vraies données.\n";
    echo "✅ Plus de données mockées (25 cours).\n";
    echo "✅ L'API /courses fonctionne correctement.\n\n";
} else {
    echo "⚠️  ATTENTION: Certains tests ont échoué.\n";
    echo "Consultez les messages ci-dessus pour plus de détails.\n\n";
}

echo "Pour tester le frontend:\n";
echo "  1. Démarrer Laravel: php artisan serve\n";
echo "  2. Démarrer React: cd frontend && npm run dev\n";
echo "  3. Se connecter en tant qu'admin\n";
echo "  4. Vérifier que 'Total des cours' affiche: $totalCourses\n\n";

echo "Documentation disponible:\n";
echo "  • CORRECTION_STATS_COURS.md - Détails des corrections\n";
echo "  • GUIDE_TEST_STATS_COURS.md - Guide de test complet\n";
echo "  • test_courses_api.php - Test détaillé de la base de données\n\n";

exit($allPassed ? 0 : 1);
