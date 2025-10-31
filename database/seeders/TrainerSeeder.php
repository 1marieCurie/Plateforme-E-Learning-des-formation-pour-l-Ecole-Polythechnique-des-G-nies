<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\TeacherProfile;

class TrainerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainers = [
            
            [
                'user' => [
                    'nom' => 'Mourad',
                    'email' => 'mourad@epg-plateforme.com',
                    'password' => Hash::make('Mourad2025!'),
                    'role' => 'formateur',
                    'tel' => '+212600000427',
                    'indicatif' => '+212',
                    'ville' => 'Casablanca',
                    'villeOrigine' => false,
                    'naissance' => '1990-01-01',
                ],
                'profile' => [
                    'specialite' => 'Développement Web',
                    'bio' => 'Nouveau formateur',
                    'experience_years' => 0,
                ],
            ],
            // Deux autres formateurs de démo
            [
                'user' => [
                    'nom' => 'Ahlam',
                    'email' => 'ahlam.trainer@example.com',
                    'password' => Hash::make('Ahlam2025!'),
                    'role' => 'formateur',
                    'tel' => '+212600000428',
                    'indicatif' => '+212',
                    'ville' => 'Rabat',
                    'villeOrigine' => false,
                    'naissance' => '1992-05-12',
                ],
                'profile' => [
                    'specialite' => 'Data Science',
                    'bio' => 'Formatrice en data débutante',
                    'experience_years' => 0,
                ],
            ],
            [
                'user' => [
                    'nom' => 'Omar',
                    'email' => 'omar.trainer@example.com',
                    'password' => Hash::make('Omar2025!'),
                    'role' => 'formateur',
                    'tel' => '+212600000429',
                    'indicatif' => '+212',
                    'ville' => 'Marrakech',
                    'villeOrigine' => true,
                    'naissance' => '1988-09-20',
                ],
                'profile' => [
                    'specialite' => 'UI/UX Design',
                    'bio' => 'Designer en reconversion vers la formation',
                    'experience_years' => 1,
                ],
            ],
        ];

        foreach ($trainers as $t) {
            $userData = $t['user'];
            $profileData = $t['profile'];

            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Créer/Mettre à jour le profil formateur lié
            TeacherProfile::updateOrCreate(
                ['user_id' => $user->id],
                array_merge($profileData, [
                    'user_id' => $user->id,
                    'is_verified' => false,
                ])
            );
        }
    }
}
