<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Utilisateur de test générique (optionnel)
        User::factory()->create([
            'nom' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seeder des formateurs de démonstration
        $this->call([
            TrainerSeeder::class,
        ]);

    }



}
