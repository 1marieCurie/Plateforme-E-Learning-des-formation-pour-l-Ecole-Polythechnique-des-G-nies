<?php
// Quick smoke test for incrementing course view_count
require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Course;

$course = Course::first();
if (!$course) {
    echo "No course found\n";
    exit(0);
}

$before = $course->view_count ?? 0;
$course->increment('view_count');
$course->refresh();
$after = $course->view_count;

echo json_encode([
    'course_id' => $course->id,
    'before' => $before,
    'after' => $after
], JSON_PRETTY_PRINT) . "\n";
