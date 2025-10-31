<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Formation;

// Trouver un formateur
$formateur = User::where('role', 'formateur')->first();

if (!$formateur) {
    echo "Aucun formateur trouvé\n";
    exit;
}

echo "Formateur trouvé: {$formateur->nom} (ID: {$formateur->id})\n";

// Essayer de récupérer ses cours
try {
    $courses = Course::with(['category', 'formation'])
                    ->whereHas('formation', function ($query) use ($formateur) {
                        $query->where('teacher_id', $formateur->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->get();
    
    echo "Nombre de cours trouvés: " . $courses->count() . "\n";
    
    foreach ($courses as $course) {
        echo "- {$course->title} (Formation: {$course->formation->title})\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
