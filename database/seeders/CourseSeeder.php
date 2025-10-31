<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Category;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            ['name' => 'Introduction à Python', 'description' => 'Apprenez les bases de Python.', 'category' => 'Développement Web'],
            ['name' => 'Excel pour débutants', 'description' => 'Maîtriser les fonctions de base d’Excel.', 'category' => 'Bureautique'],
            ['name' => 'SQL et bases de données', 'description' => 'Manipuler des bases de données relationnelles.', 'category' => 'Systèmes de gestion de base de donnée'],
            ['name' => 'Créer un site web en HTML/CSS', 'description' => 'Concevez votre premier site statique.', 'category' => 'Développement Web'],
            ['name' => 'Bien gérer votre équipe', 'description' => 'Apprendre les skills d\'etre un bon Leader ', 'category' => 'Gestion de projet'],
        ];

        foreach ($courses as $data) {
            $category = Category::where('nom', $data['category'])->first();

            if (!$category) {
                continue; // Ignore si la catégorie n’existe pas
            }

            Course::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'category_id' => $category->id,
                'created_at' => now(),
                'last_modified_at' => now(),
            ]);
        }
    }
}
