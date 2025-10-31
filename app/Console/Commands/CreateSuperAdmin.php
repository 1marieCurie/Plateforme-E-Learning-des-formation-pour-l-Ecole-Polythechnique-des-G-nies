<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\AdminProfile;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-super 
                           {email : Email du Super Admin}
                           {nom : Nom du Super Admin}
                           {password : Mot de passe}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Créer un Super Administrateur avec tous les privilèges';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $nom = $this->argument('nom');
        $password = $this->argument('password');

        // Vérifier si l'utilisateur existe déjà
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            $this->error("❌ Un utilisateur avec l'email {$email} existe déjà !");
            return Command::FAILURE;
        }

        try {
            \DB::beginTransaction();

            // Créer le Super Admin
            $superAdmin = User::create([
                'nom' => $nom,
                'email' => $email,
                'password' => Hash::make($password),
                'indicatif' => '+212',
                'tel' => '0600000000',
                'ville' => 'Système',
                'villeOrigine' => false,
                'role' => 'admin',
                'is_super_admin' => true
            ]);

            // Créer le profil admin
            AdminProfile::create([
                'user_id' => $superAdmin->id,
                'specialite' => 'Super Administration',
                'photo' => null,
                'last_login_at' => now()
            ]);

            \DB::commit();

            $this->info("🎉 Super Admin créé avec succès !");
            $this->info("📧 Email: {$email}");
            $this->info("👤 Nom: {$nom}");
            $this->info("🔑 ID: {$superAdmin->id}");
            $this->warn("⚠️  Gardez ces informations en sécurité !");

            return Command::SUCCESS;

        } catch (\Exception $e) {
            \DB::rollBack();
            $this->error("❌ Erreur lors de la création : " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
