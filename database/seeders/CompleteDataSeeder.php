<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AdminProfile;
use App\Models\StudentProfile;
use App\Models\Category;
use App\Models\Formation;
use App\Models\Course;
use App\Models\Chapter;
use App\Models\FormationEnrollment;
use App\Models\ChapterProgress;
use App\Models\FormationCertificate;
use App\Models\Assignment;
use App\Models\Permission;
use App\Models\UserPermission;

class CompleteDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        echo "\n=== REMPLISSAGE COMPLET DE LA BASE DE DONNÉES ===\n";
        
        echo "1. Création des utilisateurs de test...\n";
        
        // Nettoyage préalable
        User::where('email', 'like', '%@epg%')->delete();
        
        // Création des utilisateurs de test
        $formateur = User::create([
            'nom' => 'Prof. Ahmed BENNANI',
            'email' => 'formateur@epg.ma',
            'password' => Hash::make('formateur2025'),
            'tel' => '0661234567',
            'indicatif' => '+212',
            'ville' => 'Casablanca',
            'villeOrigine' => true,
            'naissance' => '1985-05-15',
            'role' => 'formateur',
        ]);

        $admin = User::create([
            'nom' => 'Mme. Fatima ALAMI',
            'email' => 'admin@epg.ma',
            'password' => Hash::make('admin2025'),
            'tel' => '0667891234',
            'indicatif' => '+212',
            'ville' => 'Rabat',
            'villeOrigine' => true,
            'naissance' => '1980-03-20',
            'role' => 'admin',
        ]);

        $etudiant = User::create([
            'nom' => 'Youssef TAHA',
            'email' => 'etudiant@epg.ma',
            'password' => Hash::make('etudiant2025'),
            'tel' => '0634567890',
            'indicatif' => '+212',
            'ville' => 'Marrakech',
            'villeOrigine' => false,
            'naissance' => '1995-12-10',
            'role' => 'etudiant',
        ]);

        echo "2. Création des profils utilisateurs...\n";
        
        // Profil Admin
        AdminProfile::create([
            'user_id' => $admin->id,
            'specialite' => 'Administration Éducative',
        ]);

        // Profil Étudiant
        StudentProfile::create([
            'user_id' => $etudiant->id,
            'specialite' => 'Informatique',
        ]);

        echo "3. Création des permissions admin...\n";
        
        // Nettoyage des permissions existantes
        Permission::whereIn('name', ['view_users', 'manage_users', 'manage_formations', 'manage_courses', 'view_analytics', 'manage_certificates', 'manage_permissions'])->delete();
        
        // Création des permissions
        $permissions = [
            'view_users' => ['display' => 'Voir les utilisateurs', 'desc' => 'Voir la liste des utilisateurs'],
            'manage_users' => ['display' => 'Gérer les utilisateurs', 'desc' => 'Créer, modifier, supprimer des utilisateurs'],
            'manage_formations' => ['display' => 'Gérer les formations', 'desc' => 'Gérer les formations'],
            'manage_courses' => ['display' => 'Gérer les cours', 'desc' => 'Gérer les cours'],
            'view_analytics' => ['display' => 'Voir les statistiques', 'desc' => 'Consulter les analytics'],
            'manage_certificates' => ['display' => 'Gérer les certificats', 'desc' => 'Émettre et gérer les certificats'],
            'manage_permissions' => ['display' => 'Gérer les permissions', 'desc' => 'Attribuer des permissions'],
        ];

        foreach ($permissions as $name => $data) {
            $permission = Permission::create([
                'name' => $name,
                'display_name' => $data['display'],
                'description' => $data['desc'],
                'category' => 'admin',
            ]);

            // Attribuer toutes les permissions à l'admin
            UserPermission::create([
                'user_id' => $admin->id,
                'permission_id' => $permission->id,
            ]);
        }

        echo "4. Création des catégories...\n";
        
        // Nettoyage des catégories existantes
        Category::whereIn('nom', ['Développement Web', 'Marketing Digital'])->delete();
        
        // Création des catégories nécessaires
        $catDev = Category::create([
            'nom' => 'Développement Web',
            'description' => 'Formations en développement web et mobile',
        ]);

        $catMarketing = Category::create([
            'nom' => 'Marketing Digital',
            'description' => 'Formations en marketing et communication digitale',
        ]);

        echo "5. Création des formations...\n";
        
        // Formation 1: Développement Web Full-Stack
        $formation1 = Formation::create([
            'title' => 'Développement Web Full-Stack avec Laravel',
            'description' => 'Formation complète pour devenir développeur web full-stack avec Laravel, Vue.js et MySQL. Apprenez à créer des applications web modernes et performantes.',
            'teacher_id' => $formateur->id,
            'category_id' => $catDev->id,
            'price' => 2500.00,
            'duration_hours' => 120,
            'difficulty_level' => 'intermediaire',
            'is_active' => true,
        ]);

        // Formation 2: Développement Mobile
        $formation2 = Formation::create([
            'title' => 'Développement Mobile avec Flutter',
            'description' => 'Maîtrisez Flutter pour créer des applications mobiles cross-platform. De la conception à la publication sur les stores.',
            'teacher_id' => $formateur->id,
            'category_id' => $catDev->id,
            'price' => 2800.00,
            'duration_hours' => 100,
            'difficulty_level' => 'intermediaire',
            'is_active' => true,
        ]);

        // Formation 3: Marketing Digital
        $formation3 = Formation::create([
            'title' => 'Marketing Digital et Réseaux Sociaux',
            'description' => 'Stratégies marketing digital, gestion des réseaux sociaux, SEO/SEA, analytics et conversion.',
            'teacher_id' => $formateur->id,
            'category_id' => $catMarketing->id,
            'price' => 1800.00,
            'duration_hours' => 80,
            'difficulty_level' => 'debutant',
            'is_active' => true,
        ]);

        echo "6. Création des cours et chapitres...\n";
        
        // Cours pour Formation 1 (Laravel)
        $cours1_1 = Course::create([
            'title' => 'Fondamentaux Laravel',
            'description' => 'Introduction à Laravel: MVC, routing, Eloquent ORM',
            'category_id' => $catDev->id,
            'formation_id' => $formation1->id,
            'order_index' => 1,
            'duration_minutes' => 2400, // 40h * 60min
            'difficulty_level' => 'intermediaire',
            'is_active' => true,
        ]);

        $cours1_2 = Course::create([
            'title' => 'Frontend avec Vue.js',
            'description' => 'Intégration Vue.js avec Laravel, composants réactifs',
            'category_id' => $catDev->id,
            'formation_id' => $formation1->id,
            'order_index' => 2,
            'duration_minutes' => 2100, // 35h * 60min
            'difficulty_level' => 'intermediaire',
            'is_active' => true,
        ]);

        $cours1_3 = Course::create([
            'title' => 'Déploiement et Production',
            'description' => 'Mise en production, optimisation, sécurité',
            'category_id' => $catDev->id,
            'formation_id' => $formation1->id,
            'order_index' => 3,
            'duration_minutes' => 2700, // 45h * 60min
            'difficulty_level' => 'avance',
            'is_active' => true,
        ]);

        // Cours pour Formation 2 (Flutter)
        $cours2_1 = Course::create([
            'title' => 'Flutter Basics',
            'description' => 'Widgets, navigation, state management',
            'category_id' => $catDev->id,
            'formation_id' => $formation2->id,
            'order_index' => 1,
            'duration_minutes' => 3000, // 50h * 60min
            'difficulty_level' => 'intermediaire',
            'is_active' => true,
        ]);

        $cours2_2 = Course::create([
            'title' => 'Applications Avancées',
            'description' => 'API REST, base de données locale, publication',
            'category_id' => $catDev->id,
            'formation_id' => $formation2->id,
            'order_index' => 2,
            'duration_minutes' => 3000, // 50h * 60min
            'difficulty_level' => 'avance',
            'is_active' => true,
        ]);

        // Cours pour Formation 3 (Marketing)
        $cours3_1 = Course::create([
            'title' => 'Stratégies Marketing Digital',
            'description' => 'SEO, SEA, social media, analytics',
            'category_id' => $catMarketing->id,
            'formation_id' => $formation3->id,
            'order_index' => 1,
            'duration_minutes' => 4800, // 80h * 60min
            'difficulty_level' => 'debutant',
            'is_active' => true,
        ]);

        // Chapitres pour le cours Laravel Fondamentaux
        $chapitres = [
            ['titre' => 'Installation et Configuration', 'ordre' => 1],
            ['titre' => 'Routes et Contrôleurs', 'ordre' => 2],
            ['titre' => 'Models et Eloquent ORM', 'ordre' => 3],
        ];

        foreach ($chapitres as $chapData) {
            Chapter::create([
                'titre' => $chapData['titre'],
                'description' => 'Contenu détaillé du chapitre ' . $chapData['titre'],
                'course_id' => $cours1_1->id,
            ]);
        }

        // Chapitres pour Vue.js
        $chapitresVue = [
            ['titre' => 'Introduction à Vue.js', 'ordre' => 1],
            ['titre' => 'Composants et Props', 'ordre' => 2],
            ['titre' => 'Intégration Laravel-Vue', 'ordre' => 3],
        ];

        foreach ($chapitresVue as $chapData) {
            Chapter::create([
                'titre' => $chapData['titre'],
                'description' => 'Contenu pratique pour ' . $chapData['titre'],
                'course_id' => $cours1_2->id,
            ]);
        }

        // Chapitres Flutter
        $chapitresFlutter = [
            ['titre' => 'Setup et Premier Widget', 'ordre' => 1],
            ['titre' => 'Navigation et Routing', 'ordre' => 2],
            ['titre' => 'State Management avec Provider', 'ordre' => 3],
        ];

        foreach ($chapitresFlutter as $chapData) {
            Chapter::create([
                'titre' => $chapData['titre'],
                'description' => 'Tutoriel Flutter: ' . $chapData['titre'],
                'course_id' => $cours2_1->id,
            ]);
        }

        echo "7. Création d'étudiants supplémentaires...\n";
        
        // Création d'étudiants supplémentaires
        $noms = [
            'Aicha AMRANI', 'Mohammed BERRADA', 'Salma CHERIF', 'Omar DAOUDI',
            'Nadia EL FASSI', 'Youssef GHALI', 'Khadija HAJJI', 'Said IDRISSI',
            'Malika JALLAL', 'Hassan KADIRI', 'Latifa LOUALI', 'Rachid MANSOURI',
            'Zineb NACIRI', 'Khalid OUALI', 'Amina QADIRI'
        ];

        $etudiants = [];
        foreach ($noms as $index => $nom) {
            $email = strtolower(str_replace(' ', '.', $nom)) . '@epg-test.ma';
            $etudiantSupp = User::create([
                'nom' => $nom,
                'email' => $email,
                'password' => Hash::make('password123'),
                'tel' => '067' . sprintf('%07d', $index + 1000000),
                'ville' => ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'][rand(0, 4)],
                'villeOrigine' => rand(0, 1) == 1,
                'role' => 'etudiant',
            ]);

            StudentProfile::create([
                'user_id' => $etudiantSupp->id,
                'specialite' => ['Informatique', 'Marketing', 'Design', 'Commerce'][rand(0, 3)],
            ]);

            $etudiants[] = $etudiantSupp;
        }

        echo "8. Création des inscriptions aux formations...\n";
        
        // Inscription de l'étudiant principal aux 3 formations
        FormationEnrollment::create([
            'user_id' => $etudiant->id,
            'formation_id' => $formation1->id,
            'enrolled_at' => now()->subDays(30),
            'progress_percentage' => 65.0,
        ]);

        FormationEnrollment::create([
            'user_id' => $etudiant->id,
            'formation_id' => $formation2->id,
            'enrolled_at' => now()->subDays(20),
            'progress_percentage' => 40.0,
        ]);

        FormationEnrollment::create([
            'user_id' => $etudiant->id,
            'formation_id' => $formation3->id,
            'enrolled_at' => now()->subDays(10),
            'progress_percentage' => 100.0,
            'completed_at' => now()->subDays(3),
            'certificate_issued' => true,
        ]);

        // Inscriptions des autres étudiants
        foreach ($etudiants as $etud) {
            // Chaque étudiant s'inscrit à 1-2 formations au hasard
            $formations = collect([$formation1, $formation2, $formation3])->random(rand(1, 2));
            foreach ($formations as $formation) {
                FormationEnrollment::create([
                    'user_id' => $etud->id,
                    'formation_id' => $formation->id,
                    'enrolled_at' => now()->subDays(rand(5, 60)),
                    'progress_percentage' => rand(10, 95),
                ]);
            }
        }

        echo "9. Création des progressions...\n";
        
        // Progression pour l'étudiant principal
        $allChapters = Chapter::all();
        foreach ($allChapters as $chapter) {
            // Progression variable selon la formation
            $isRead = rand(0, 1) == 1;
            
            ChapterProgress::create([
                'user_id' => $etudiant->id,
                'chapter_id' => $chapter->id,
                'course_id' => $chapter->course_id,
                'is_read' => $isRead,
                'reading_time_seconds' => $isRead ? rand(300, 3600) : 0,
                'first_read_at' => $isRead ? now()->subDays(rand(1, 15)) : null,
                'last_read_at' => $isRead ? now()->subDays(rand(0, 5)) : null,
            ]);
        }

        echo "10. Création des devoirs...\n";
        
        // Devoirs pour les cours
        Assignment::create([
            'title' => 'Projet Laravel - Système de Blog',
            'description' => 'Créer un système de blog complet avec authentification, CRUD articles, commentaires',
            'type' => 'tp',
            'course_id' => $cours1_1->id,
            'teacher_id' => $formateur->id,
            'max_points' => 20,
            'due_date' => now()->addDays(14),
            'available_from' => now(),
            'is_active' => true,
        ]);

        Assignment::create([
            'title' => 'Interface Vue.js Interactive',
            'description' => 'Développer une interface utilisateur réactive avec Vue.js et intégration API',
            'type' => 'tp',
            'course_id' => $cours1_2->id,
            'teacher_id' => $formateur->id,
            'max_points' => 20,
            'due_date' => now()->addDays(21),
            'available_from' => now(),
            'is_active' => true,
        ]);

        Assignment::create([
            'title' => 'App Mobile Flutter',
            'description' => 'Application mobile de gestion de tâches avec persistance locale',
            'type' => 'tp',
            'course_id' => $cours2_1->id,
            'teacher_id' => $formateur->id,
            'max_points' => 20,
            'due_date' => now()->addDays(28),
            'available_from' => now(),
            'is_active' => true,
        ]);

        Assignment::create([
            'title' => 'QCM Marketing Digital',
            'description' => 'Questionnaire sur les fondamentaux du marketing digital',
            'type' => 'qcm',
            'course_id' => $cours3_1->id,
            'teacher_id' => $formateur->id,
            'max_points' => 20,
            'duration_minutes' => 45,
            'due_date' => now()->addDays(7),
            'available_from' => now(),
            'is_active' => true,
        ]);

        echo "11. Génération des certificats...\n";
        
        // Certificats pour les formations terminées
        FormationCertificate::create([
            'user_id' => $etudiant->id,
            'formation_id' => $formation3->id,
            'certificate_number' => 'EPG-CERT-' . now()->format('Ymd') . '-001',
            'title' => 'Certificat Marketing Digital',
            'description' => 'Certification en Marketing Digital et Réseaux Sociaux',
            'overall_grade' => 85.5,
            'total_hours_completed' => 80,
            'total_courses_completed' => 1,
            'formation_started_at' => now()->subDays(35),
            'formation_completed_at' => now()->subDays(3),
            'certificate_issued_at' => now()->subDays(3),
            'issued_by' => $admin->id,
            'verification_code' => 'VERIFY-' . now()->format('Ymd') . '-001',
        ]);

        // Quelques certificats pour d'autres étudiants
        for ($i = 0; $i < 3; $i++) {
            FormationCertificate::create([
                'user_id' => $etudiants[$i]->id,
                'formation_id' => $formation3->id,
                'certificate_number' => 'EPG-CERT-' . now()->format('Ymd') . '-' . sprintf('%03d', $i + 2),
                'title' => 'Certificat Marketing Digital',
                'description' => 'Certification en Marketing Digital et Réseaux Sociaux',
                'overall_grade' => rand(75, 95),
                'total_hours_completed' => 80,
                'total_courses_completed' => 1,
                'formation_started_at' => now()->subDays(rand(40, 60)),
                'formation_completed_at' => now()->subDays(rand(1, 10)),
                'certificate_issued_at' => now()->subDays(rand(1, 10)),
                'issued_by' => $admin->id,
                'verification_code' => 'VERIFY-' . now()->format('Ymd') . '-' . sprintf('%03d', $i + 2),
            ]);
        }

        echo "\n✅ BASE DE DONNÉES REMPLIE AVEC SUCCÈS !\n";
        echo "📊 Résumé des données créées:\n";
        echo "   - Utilisateurs: " . User::count() . "\n";
        echo "   - Catégories: " . Category::count() . "\n";
        echo "   - Formations: " . Formation::count() . "\n";
        echo "   - Cours: " . Course::count() . "\n";
        echo "   - Chapitres: " . Chapter::count() . "\n";
        echo "   - Inscriptions: " . FormationEnrollment::count() . "\n";
        echo "   - Progressions: " . ChapterProgress::count() . "\n";
        echo "   - Devoirs: " . Assignment::count() . "\n";
        echo "   - Certificats: " . FormationCertificate::count() . "\n";
        echo "   - Permissions: " . Permission::count() . "\n";
        echo "\n🔑 Comptes de test créés:\n";
        echo "   - Formateur: formateur@epg.ma / formateur2025\n";
        echo "   - Admin: admin@epg.ma / admin2025\n";
        echo "   - Étudiant: etudiant@epg.ma / etudiant2025\n";
        echo "\n🚀 Votre plateforme EPG est prête pour les tests !\n\n";
    }
}
