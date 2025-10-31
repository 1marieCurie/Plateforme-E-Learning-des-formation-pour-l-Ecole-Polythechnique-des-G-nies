<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->boot();

$course = \App\Models\Course::first();
if($course) {
    echo "Course trouvé: " . $course->title . " (ID: " . $course->id . ")" . PHP_EOL;
    echo "Chapitres existants: " . $course->chapters()->count() . PHP_EOL;
    
    if($course->chapters()->count() == 0) {
        $chapter = $course->chapters()->create([
            'titre' => 'Chapitre de test',
            'description' => 'Description du chapitre de test',
            'order_index' => 1,
            'is_active' => true
        ]);
        echo "Chapitre créé avec succès: " . $chapter->titre . PHP_EOL;
    } else {
        $chapters = $course->chapters()->get();
        foreach($chapters as $chapter) {
            echo "Chapitre: " . $chapter->titre . PHP_EOL;
        }
    }
} else {
    echo "Aucun cours trouvé" . PHP_EOL;
}
