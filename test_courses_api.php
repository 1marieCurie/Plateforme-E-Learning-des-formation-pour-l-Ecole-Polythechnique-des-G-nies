<?php

/**
 * Script de test pour vérifier l'API /courses
 * Execute: php test_courses_api.php
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST API COURSES ===\n\n";

// 1. Compter les cours dans la base de données
echo "1. Nombre total de cours dans la base de données:\n";
$totalCourses = DB::table('courses')->count();
echo "   Total: $totalCourses cours\n\n";

// 2. Compter les cours actifs
echo "2. Nombre de cours actifs (is_active = 1):\n";
$activeCourses = DB::table('courses')->where('is_active', 1)->count();
echo "   Actifs: $activeCourses cours\n\n";

// 3. Lister tous les cours avec leurs détails
echo "3. Liste des cours:\n";
$courses = DB::table('courses')
    ->select('id', 'title', 'formation_id', 'category_id', 'is_active', 'order_index')
    ->orderBy('id')
    ->get();

foreach ($courses as $course) {
    $status = $course->is_active ? '✓ Actif' : '✗ Inactif';
    echo "   [{$course->id}] {$course->title} | Formation: {$course->formation_id} | Catégorie: {$course->category_id} | $status\n";
}
echo "\n";

// 4. Vérifier les relations
echo "4. Vérification des relations:\n";
$coursesWithRelations = DB::table('courses')
    ->leftJoin('formations', 'courses.formation_id', '=', 'formations.id')
    ->leftJoin('categories', 'courses.category_id', '=', 'categories.id')
    ->select(
        'courses.id', 
        'courses.title', 
        'formations.title as formation_title',
        'categories.nom as category_name'
    )
    ->get();

foreach ($coursesWithRelations as $course) {
    echo "   [{$course->id}] {$course->title}\n";
    echo "      Formation: " . ($course->formation_title ?? 'NON ASSIGNÉE') . "\n";
    echo "      Catégorie: " . ($course->category_name ?? 'NON ASSIGNÉE') . "\n";
}
echo "\n";

// 5. Statistiques d'inscriptions
echo "5. Statistiques d'inscriptions par cours:\n";
$enrollmentStats = DB::table('courses')
    ->leftJoin('formations', 'courses.formation_id', '=', 'formations.id')
    ->leftJoin('formation_enrollments', 'formations.id', '=', 'formation_enrollments.formation_id')
    ->select(
        'courses.id',
        'courses.title',
        DB::raw('COUNT(DISTINCT formation_enrollments.user_id) as enrolled_students')
    )
    ->groupBy('courses.id', 'courses.title')
    ->orderBy('enrolled_students', 'desc')
    ->get();

$totalEnrollments = 0;
foreach ($enrollmentStats as $stat) {
    echo "   [{$stat->id}] {$stat->title}: {$stat->enrolled_students} étudiants inscrits\n";
    $totalEnrollments += $stat->enrolled_students;
}
echo "   TOTAL: $totalEnrollments inscriptions\n\n";

// 6. Vérifier les chapitres
echo "6. Nombre de chapitres par cours:\n";
$chapterStats = DB::table('courses')
    ->leftJoin('chapters', 'courses.id', '=', 'chapters.course_id')
    ->select(
        'courses.id',
        'courses.title',
        DB::raw('COUNT(chapters.id) as chapter_count')
    )
    ->groupBy('courses.id', 'courses.title')
    ->orderBy('courses.id')
    ->get();

foreach ($chapterStats as $stat) {
    echo "   [{$stat->id}] {$stat->title}: {$stat->chapter_count} chapitres\n";
}
echo "\n";

// Résumé
echo "=== RÉSUMÉ ===\n";
echo "Total cours en base: $totalCourses\n";
echo "Cours actifs: $activeCourses\n";
echo "Total inscriptions: $totalEnrollments\n";
echo "\nCe script confirme le nombre réel de cours dans votre base de données.\n";
echo "Si le frontend affiche 25 cours, c'est qu'il utilise des données mockées.\n";
