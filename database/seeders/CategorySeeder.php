<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Réseaux informatique',
            'Marketing digital',
            'Cybersécurité',
            'Dessin Technique & Multimédia',
            'Gestion de projet',
            'Bureautique',
            'Technologie Web',
            'Développement mobile',
            'Systèmes d\'exploitation',
            'Image vidéo animation et réalité virtuelle',
            'Systèmes de gestion de base de donnée',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate([
                'nom' => $name,
                'description' => 'Catégorie : ' . $name
            ]);
        }
    }
}

