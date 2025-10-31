<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Vérifier le Super Admin
$superAdmin = \App\Models\User::where('email', 'admin@epg.ma')->first();

if ($superAdmin) {
    echo "🔱 SUPER ADMIN TROUVÉ :\n";
    echo "ID: " . $superAdmin->id . "\n";
    echo "Nom: " . $superAdmin->nom . "\n";
    echo "Email: " . $superAdmin->email . "\n";
    echo "Téléphone: " . $superAdmin->tel . "\n";
    echo "Role: " . $superAdmin->role . "\n";
    echo "Super Admin: " . ($superAdmin->is_super_admin ? 'OUI' : 'NON') . "\n";
    echo "Créé le: " . $superAdmin->created_at . "\n";
    
    // Vérifier le profil admin
    $profile = $superAdmin->adminProfile;
    if ($profile) {
        echo "\n📋 PROFIL ADMIN :\n";
        echo "Profil ID: " . $profile->id . "\n";
        echo "Spécialité: " . ($profile->specialite ?? 'Non définie') . "\n";
        echo "Dernière connexion: " . ($profile->last_login_at ?? 'Jamais') . "\n";
    } else {
        echo "\n❌ Aucun profil admin trouvé ! Création en cours...\n";
        // Créer le profil admin manquant
        $profile = new \App\Models\AdminProfile();
        $profile->user_id = $superAdmin->id;
        $profile->specialite = 'Super Administration';
        $profile->save();
        echo "✅ Profil Super Admin créé avec succès !\n";
    }
} else {
    echo "❌ SUPER ADMIN NON TROUVÉ !\n";
}
