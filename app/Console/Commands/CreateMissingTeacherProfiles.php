<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\TeacherProfile;

class CreateMissingTeacherProfiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'profiles:create-missing-teachers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crée les profils formateurs manquants pour les utilisateurs ayant le rôle formateur';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Recherche des formateurs sans profil...');
        
        // Récupérer tous les utilisateurs formateurs
        $formateurs = User::where('role', 'formateur')->get();
        
        $this->info("📊 {$formateurs->count()} formateurs trouvés dans la table users");
        
        $profilsCrees = 0;
        $profilsExistants = 0;
        
        foreach ($formateurs as $formateur) {
            // Vérifier si le profil existe déjà
            $profilExistant = TeacherProfile::where('user_id', $formateur->id)->first();
            
            if (!$profilExistant) {
                // Créer le profil manquant
                TeacherProfile::create([
                    'user_id' => $formateur->id,
                    'specialite' => 'Développement Web', // Valeur par défaut
                    'bio' => 'Formateur expérimenté',
                    'experience_years' => 1,
                    'is_verified' => false,
                    'average_rating' => 0.00,
                    'total_students' => 0,
                    'total_formations' => 0,
                    'total_courses' => 0,
                    'last_login_at' => now(),
                ]);
                
                $profilsCrees++;
                $this->line("✅ Profil créé pour {$formateur->nom} (ID: {$formateur->id})");
            } else {
                $profilsExistants++;
                $this->line("ℹ️  Profil existe déjà pour {$formateur->nom} (ID: {$formateur->id})");
            }
        }
        
        $this->newLine();
        $this->info("📈 Résumé:");
        $this->info("   • Profils créés: {$profilsCrees}");
        $this->info("   • Profils existants: {$profilsExistants}");
        $this->info("   • Total formateurs: {$formateurs->count()}");
        
        if ($profilsCrees > 0) {
            $this->info("🎉 {$profilsCrees} profils formateurs ont été créés avec succès!");
        } else {
            $this->info("✨ Tous les formateurs ont déjà leur profil!");
        }
        
        return Command::SUCCESS;
    }
}
