<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\AdminProfile;

class FixMissingProfilesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "=== CORRECTION DES PROFILS MANQUANTS ===\n";

        // Créer les profils étudiants manquants
        $studentsWithoutProfile = User::where('role', 'etudiant')
            ->whereDoesntHave('studentProfile')
            ->get();

        echo "Création de " . $studentsWithoutProfile->count() . " profils étudiants...\n";

        foreach ($studentsWithoutProfile as $user) {
            StudentProfile::create([
                'user_id' => $user->id,
                'specialite' => 'Informatique',
                'photo' => null,
                'last_login_at' => now()
            ]);
            echo "✅ Profil étudiant créé pour {$user->nom}\n";
        }

        // Créer les profils formateurs manquants
        $teachersWithoutProfile = User::where('role', 'formateur')
            ->whereDoesntHave('teacherProfile')
            ->get();

        echo "Création de " . $teachersWithoutProfile->count() . " profils formateurs...\n";

        foreach ($teachersWithoutProfile as $user) {
            TeacherProfile::create([
                'user_id' => $user->id,
                'specialite' => 'Informatique',
                'bio' => 'Formateur expérimenté',
                'experience_years' => 5,
                'photo' => null,
                'linkedin_url' => null,
                'website_url' => null,
                'certifications' => json_encode(['Master en informatique']),
                'skills' => json_encode(['PHP', 'Laravel', 'JavaScript']),
                'is_verified' => true,
                'average_rating' => 4.5,
                'total_students' => 0,
                'total_formations' => 0,
                'total_courses' => 0,
                'last_login_at' => now()
            ]);
            echo "✅ Profil formateur créé pour {$user->nom}\n";
        }

        // Créer les profils admins manquants
        $adminsWithoutProfile = User::where('role', 'admin')
            ->whereDoesntHave('adminProfile')
            ->get();

        echo "Création de " . $adminsWithoutProfile->count() . " profils admins...\n";

        foreach ($adminsWithoutProfile as $user) {
            AdminProfile::create([
                'user_id' => $user->id,
                'specialite' => 'Administration',
                'photo' => null,
                'last_login_at' => now()
            ]);
            echo "✅ Profil admin créé pour {$user->nom}\n";
        }

        echo "\n🎉 TOUS LES PROFILS ONT ÉTÉ CRÉÉS AVEC SUCCÈS !\n";
    }
}
