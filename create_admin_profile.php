<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Récupérer l'admin normal
$user = \App\Models\User::where('email', 'admin-normal@epg.ma')->first();

if ($user) {
    echo "User ID: " . $user->id . "\n";
    
    // Créer le profil admin
    $profile = new \App\Models\AdminProfile();
    $profile->user_id = $user->id;
    $profile->specialite = 'Gestion générale';
    $profile->save();
    
    echo "Profil admin créé avec succès !\n";
} else {
    echo "Utilisateur non trouvé !\n";
}
