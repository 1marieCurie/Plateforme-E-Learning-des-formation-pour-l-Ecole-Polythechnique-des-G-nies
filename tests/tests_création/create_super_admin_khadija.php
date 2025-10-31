
<?php
// Script de création d'un super admin "Khadija" pour tests

// Charger l'autoloader et l'application Laravel
require_once __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';

// 2. Démarrer le kernel pour Eloquent
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AdminProfile;

echo "[1/4] Démarrage du script de création du super admin...\n";

try {
    // Identifiants à mémoriser
    $nom = 'KhadijaTest';
    $email = 'khadija.superadmin@example.com';
    $password = 'SuperAdminTest2025!';
    $tel = '+212600000000';
    $indicatif = '+212';
    $ville = 'Casablanca';
    $villeOrigine = 1;
    $naissance = '1980-01-01';
    $role = 'super_admin';
    $is_super_admin = 1;

    echo "[2/4] Création du compte utilisateur...\n";
    $user = User::create([
        'nom' => $nom,
        'email' => $email,
        'password' => Hash::make($password),
        'tel' => $tel,
        'indicatif' => $indicatif,
        'ville' => $ville,
        'villeOrigine' => $villeOrigine,
        'naissance' => $naissance,
        'role' => $role,
        'is_super_admin' => $is_super_admin,
    ]);

    echo "[3/4] Création du profil admin associé...\n";
    $adminProfile = AdminProfile::create([
        'user_id' => $user->id,
        'specialite' => 'Direction',
        'photo' => null,
        'last_login_at' => now(),
    ]);

    echo "[4/4] Super admin créé avec succès !\n";
    echo "Identifiants à utiliser en frontend :\n";
    echo "  Email : $email\n";
    echo "  Mot de passe : $password\n";
    echo "  Nom : $nom\n";
    echo "  Rôle : $role\n";
    echo "  is_super_admin : $is_super_admin\n";
    echo "\nConnexion possible via le frontend avec ces identifiants.\n";
} catch (Exception $e) {
    echo "Erreur lors de la création du super admin : " . $e->getMessage() . "\n";
    if (method_exists($e, 'getTraceAsString')) {
        echo $e->getTraceAsString() . "\n";
    }
    exit(1);
}
