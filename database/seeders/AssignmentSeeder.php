<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Assignment;
use App\Models\User;
use App\Models\Course;

class AssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupérer quelques étudiants et cours pour les tests
        $students = User::where('role', 'etudiant')->take(3)->get();
        $courses = Course::take(2)->get();

        if ($students->isEmpty() || $courses->isEmpty()) {
            $this->command->info('Aucun étudiant ou cours trouvé. Créez d\'abord des utilisateurs et des cours.');
            return;
        }

        $assignmentTypes = ['tp', 'td', 'controle', 'qcm'];
        $statuses = ['pending', 'submitted', 'graded'];

        foreach ($students as $student) {
            foreach ($courses as $course) {
                // Créer 2-3 devoirs par étudiant par cours
                for ($i = 1; $i <= rand(2, 3); $i++) {
                    $type = $assignmentTypes[array_rand($assignmentTypes)];
                    $status = $statuses[array_rand($statuses)];
                    $dueDate = now()->addDays(rand(-7, 14)); // Entre 7 jours passés et 14 jours futurs
                    
                    $assignment = Assignment::create([
                        'title' => ucfirst($type) . ' #' . $i . ' - ' . $course->title,
                        'description' => 'Description du ' . $type . ' pour le cours ' . $course->title . '. Exercice pratique à réaliser.',
                        'type' => $type,
                        'course_id' => $course->id,
                        'student_id' => $student->id,
                        'status' => $status,
                        'due_date' => $dueDate,
                        'submitted_at' => $status !== 'pending' ? now()->subDays(rand(1, 5)) : null,
                        'grade' => $status === 'graded' ? rand(8, 20) : null,
                        'feedback' => $status === 'graded' ? 'Bon travail ! Quelques améliorations possibles sur la structure.' : null,
                        'graded_at' => $status === 'graded' ? now()->subDays(rand(0, 3)) : null,
                    ]);

                    // Simuler un fichier pour les devoirs soumis
                    if ($status !== 'pending') {
                        $assignment->update([
                            'file_path' => 'assignments/sample_' . $assignment->id . '.pdf',
                            'file_name' => 'Devoir_' . $student->name . '_' . $type . '.pdf',
                            'file_type' => 'application/pdf',
                            'file_size' => rand(50000, 2000000), // Entre 50KB et 2MB
                        ]);
                    }
                }
            }
        }

        $this->command->info('Devoirs de test créés avec succès !');
    }
}
