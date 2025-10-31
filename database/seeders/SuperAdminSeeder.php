<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Créer le Super Admin par défaut
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@epg-plateforme.com'],
            [
                'nom' => 'Super Administrateur',
                'password' => Hash::make('SuperAdmin2024!'),
                'role' => 'super_admin',
                'tel' => '+212600000000',
                'indicatif' => '+212',
                'ville' => 'Casablanca',
                'villeOrigine' => false,
                'naissance' => '1990-01-01',
                'email_verified_at' => now(),
            ]
        );
        $this->command->info("Super Admin créé avec succès !");
        $this->command->info("Email: superadmin@epg-plateforme.com");
        $this->command->info("Mot de passe: SuperAdmin2024!");

        // Créer un nouveau super admin personnalisé
        $superAdmin2 = User::firstOrCreate(
            ['email' => 'ahemd-superdo@epg-plateforme.com'],
            [
                'nom' => 'ahemd-superdo',
                'password' => Hash::make('AhmedSuperdo2025!'),
                'role' => 'super_admin',
                'tel' => '+212611111111',
                'indicatif' => '+212',
                'ville' => 'Rabat',
                'villeOrigine' => false,
                'naissance' => '1995-05-05',
                'email_verified_at' => now(),
            ]
        );
        $this->command->info("Super Admin personnalisé créé avec succès !");
        $this->command->info("Email: ahemd-superdo@epg-plateforme.com");
        $this->command->info("Mot de passe: AhmedSuperdo2025!");
        
        // Créer un admin de test
        $admin1 = User::firstOrCreate(
            ['email' => 'admin1@epg-plateforme.com'],
            [
                'nom' => 'Admin Test 1',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'tel' => '+212600000001',
                'indicatif' => '+212',
                'ville' => 'Rabat',
                'villeOrigine' => false,
                'naissance' => '1985-05-15',
            ]
        );

        // Créer un formateur de test
        $formateur1 = User::firstOrCreate(
            ['email' => 'formateur1@epg-plateforme.com'],
            [
                'nom' => 'Formateur Test 1',
                'password' => Hash::make('password123'),
                'role' => 'formateur',
                'tel' => '+212600000002',
                'indicatif' => '+212',
                'ville' => 'Marrakech',
                'villeOrigine' => false,
                'naissance' => '1988-03-20',
            ]
        );

        // Créer un étudiant de test
        $etudiant1 = User::firstOrCreate(
            ['email' => 'etudiant1@epg-plateforme.com'],
            [
                'nom' => 'Étudiant Test 1',
                'password' => Hash::make('password123'),
                'role' => 'etudiant',
                'tel' => '+212600000003',
                'indicatif' => '+212',
                'ville' => 'Fès',
                'villeOrigine' => false,
                'naissance' => '1995-07-10',
            ]
        );

        $this->command->info("Utilisateurs de test créés :");
        $this->command->info("- Super Admin: superadmin@epg-plateforme.com / SuperAdmin2024!");
        $this->command->info("- Admin: admin1@epg-plateforme.com / password123");
        $this->command->info("- Formateur: formateur1@epg-plateforme.com / password123");
        $this->command->info("- Étudiant: etudiant1@epg-plateforme.com / password123");
    }
}
