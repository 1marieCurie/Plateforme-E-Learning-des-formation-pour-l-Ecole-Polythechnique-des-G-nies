<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\AdminProfile;
use Illuminate\Support\Facades\Hash;

// Création de l'utilisateur admin normal
$admin = User::create([
    'nom' => 'Admin Normal',
    'email' => 'adminnormal@epg-plateforme.com',
    'password' => Hash::make('AdminNormal2024!'),
    'role' => 'admin',
    'tel' => '+212600000001',
    'indicatif' => '+212',
    'ville' => 'Rabat',
    'villeOrigine' => false,
    'naissance' => '1992-05-10',
    'email_verified_at' => now(),
]);

// Création du profil admin lié
AdminProfile::create([
    'user_id' => $admin->id,
    'specialite' => 'Gestion générale',
    'photo' => null,
    'last_login_at' => now(),
]);

echo "Admin normal créé avec succès !\n";
