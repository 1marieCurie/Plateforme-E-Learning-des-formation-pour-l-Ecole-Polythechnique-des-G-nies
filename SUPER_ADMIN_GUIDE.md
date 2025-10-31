# 🔱 GUIDE SUPER ADMIN - CRÉATION ET IDENTIFIANTS

## 📋 **IDENTIFIANTS SUPER ADMIN ACTUEL**

### **🎯 Compte Super Admin Principal**
```
👤 Nom:           Fatine
📧 Email:         admin@epg.ma
🔐 Mot de passe:  admin2025
📱 Téléphone:     0667891234
🆔 User ID:       159
📋 Profil ID:     17
🎯 Spécialité:    Super Administration
📅 Créé le:       25 juillet 2025 - 09:34:06
🔱 Status:        SUPER ADMIN ACTIF ✅
```

**🔐 Connexion rapide :**
```json
POST /api/login
{
    "email": "admin@epg.ma",
    "password": "admin2025"
}
```

---

## 🛠️ **ÉTAPES DE CRÉATION D'UN SUPER ADMIN VIA TERMINAL**

### **Méthode 1: Commande Artisan (Recommandée)**

#### 1️⃣ **Création complète d'un nouveau Super Admin**
```bash
# Syntaxe générale
php artisan admin:create-super [EMAIL] [NOM] [MOT_DE_PASSE]

# Exemple pratique
php artisan admin:create-super superadmin@epg.ma "Super Admin Principal" "MotDePasseSecurise2025"
```

**✅ Cette commande fait automatiquement :**
- Crée l'utilisateur avec `role = 'admin'`
- Définit `is_super_admin = true`
- Génère un profil admin associé
- Hash le mot de passe de façon sécurisée
- Vérifie l'unicité de l'email

#### 2️⃣ **Vérifier la création**
```bash
# Lister tous les Super Admins
php artisan tinker --execute="
    \$superAdmins = \App\Models\User::where('is_super_admin', true)->get();
    foreach(\$superAdmins as \$admin) {
        echo 'ID: ' . \$admin->id . ' - ' . \$admin->nom . ' (' . \$admin->email . ')' . PHP_EOL;
    }
"
```

### **Méthode 2: Via Base de Données Directe**

#### 1️⃣ **Créer l'utilisateur**
```sql
INSERT INTO users (nom, email, password, tel, role, is_super_admin, created_at, updated_at) 
VALUES (
    'Super Admin', 
    'superadmin@epg.ma', 
    '$2y$12$HashedPasswordHere', 
    '0123456789', 
    'admin', 
    true, 
    NOW(), 
    NOW()
);
```

#### 2️⃣ **Créer le profil admin**
```sql
-- Récupérer l'ID de l'utilisateur créé
SET @user_id = LAST_INSERT_ID();

-- Créer le profil
INSERT INTO admin_profiles (user_id, specialite, created_at, updated_at) 
VALUES (@user_id, 'Super Administration', NOW(), NOW());
```

### **Méthode 3: Via Artisan Tinker**

#### 1️⃣ **Ouvrir Tinker**
```bash
php artisan tinker
```

#### 2️⃣ **Créer le Super Admin**
```php
// Dans Tinker
use App\Models\User;
use App\Models\AdminProfile;
use Illuminate\Support\Facades\Hash;

// Créer l'utilisateur
$user = User::create([
    'nom' => 'Super Admin Nouveau',
    'email' => 'nouveausuperadmin@epg.ma',
    'password' => Hash::make('MotDePasseSecurise2025'),
    'tel' => '0123456789',
    'role' => 'admin',
    'is_super_admin' => true
]);

// Créer le profil
AdminProfile::create([
    'user_id' => $user->id,
    'specialite' => 'Super Administration'
]);

echo "Super Admin créé avec l'ID: " . $user->id;
```

---

## 🔧 **COMMANDES DE GESTION UTILES**

### **Promouvoir un admin existant en Super Admin**
```bash
# Via Tinker
php artisan tinker --execute="
    \$user = \App\Models\User::where('email', 'admin-normal@epg.ma')->first();
    if(\$user) {
        \$user->is_super_admin = true;
        \$user->save();
        echo 'Admin promu en Super Admin: ' . \$user->nom;
    } else {
        echo 'Utilisateur non trouvé';
    }
"
```

### **Rétrograder un Super Admin**
```bash
# Via Tinker (ATTENTION : Ne pas se rétrograder soi-même !)
php artisan tinker --execute="
    \$user = \App\Models\User::where('email', 'admin-a-retrograder@epg.ma')->first();
    if(\$user && \$user->email !== 'admin@epg.ma') {
        \$user->is_super_admin = false;
        \$user->save();
        echo 'Super Admin rétrogradé: ' . \$user->nom;
    } else {
        echo 'Opération non autorisée ou utilisateur non trouvé';
    }
"
```

### **Changer le mot de passe d'un Super Admin**
```bash
# Via Tinker
php artisan tinker --execute="
    \$user = \App\Models\User::where('email', 'admin@epg.ma')->first();
    if(\$user) {
        \$user->password = Hash::make('NouveauMotDePasse2025');
        \$user->save();
        echo 'Mot de passe modifié pour: ' . \$user->nom;
    }
"
```

### **Lister tous les Super Admins**
```bash
php artisan tinker --execute="
    echo 'Liste des Super Admins:' . PHP_EOL;
    \$superAdmins = \App\Models\User::where('is_super_admin', true)->get();
    foreach(\$superAdmins as \$admin) {
        echo '- ID: ' . \$admin->id . ' | ' . \$admin->nom . ' (' . \$admin->email . ')' . PHP_EOL;
    }
    echo 'Total: ' . \$superAdmins->count() . ' Super Admins';
"
```

---

## 🔐 **RÈGLES DE SÉCURITÉ IMPORTANTES**

### **❌ INTERDICTIONS :**
1. **Ne jamais supprimer tous les Super Admins** - Garde toujours au moins un compte
2. **Ne jamais partager les identifiants** - Chaque Super Admin a son compte
3. **Ne pas utiliser des mots de passe faibles** - Minimum 8 caractères avec complexité
4. **Ne pas créer de Super Admin via l'interface web** - Seulement via terminal sécurisé

### **✅ BONNES PRATIQUES :**
1. **Changement régulier des mots de passe** - Tous les 3-6 mois
2. **Limitation du nombre de Super Admins** - Maximum 2-3 comptes
3. **Documentation des actions** - Tracer qui fait quoi
4. **Sauvegarde des identifiants** - Dans un coffre-fort sécurisé

---

## 🧪 **TESTS DE VALIDATION**

### **Test 1: Connexion Super Admin**
```bash
# PowerShell
$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"admin@epg.ma","password":"admin2025"}'
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method POST -Headers $headers -Body $body
echo "Token reçu: $($response.token -ne $null)"
```

### **Test 2: Accès privilégié**
```bash
# Avec le token obtenu
$token = "VOTRE_TOKEN_ICI"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles" -Method GET -Headers $headers
```

### **Test 3: Vérification base de données**
```bash
php artisan tinker --execute="
    \$user = \App\Models\User::find(159);
    echo 'Super Admin Status: ' . (\$user->is_super_admin ? 'ACTIF' : 'INACTIF');
"
```

---

## 🚀 **ROUTES DE TEST SUPER ADMIN**

### **📍 URLs de Base**
```
Base URL: http://127.0.0.1:8000/api
Environment: Développement local
Server: Laravel artisan serve
```

### **🔐 Authentification**

#### **POST /api/login - Connexion Super Admin**
```bash
# PowerShell
$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"admin@epg.ma","password":"admin2025"}'
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method POST -Headers $headers -Body $body
$superToken = $response.token
echo "Super Admin connecté - Token: $superToken"
```

**Réponse attendue :**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 159,
        "nom": "Fatine",
        "email": "admin@epg.ma",
        "role": "admin",
        "is_super_admin": true
    }
}
```

### **👑 Routes Super Admin Privilégiées**

#### **GET /api/admin-profiles - Liste tous les profils admin**
```bash
# PowerShell - Accès autorisé pour Super Admin
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
$result = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles" -Method GET -Headers $headers
echo "Nombre d'admins trouvés: $($result.Count)"
```

**✅ Résultat attendu :** Liste complète des profils admin  
**❌ Pour admin normal :** 403 Forbidden

#### **GET /api/admin-profiles/{id} - Voir profil admin spécifique**
```bash
# PowerShell - Super Admin peut voir n'importe quel profil
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$adminId = 184  # ID d'un admin normal
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles/$adminId" -Method GET -Headers $headers
```

**✅ Super Admin :** Accès à tous les profils  
**❌ Admin normal :** Seulement son propre profil

#### **PUT /api/admin-profiles/{id} - Modifier profil admin**
```bash
# PowerShell - Super Admin peut modifier n'importe quel profil
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$adminId = 184
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
$body = '{"specialite":"Administration modifiée"}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles/$adminId" -Method PUT -Headers $headers -Body $body
```

#### **DELETE /api/admin-profiles/{id} - Supprimer admin**
```bash
# PowerShell - Seul Super Admin peut supprimer
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$adminId = 184  # Admin normal à supprimer
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles/$adminId" -Method DELETE -Headers $headers
```

**🔒 Protections :**
- ❌ Suppression d'autres Super Admins : 403 Forbidden
- ❌ Auto-suppression : 403 Forbidden
- ✅ Suppression admin normal : 200 OK

### **👥 Routes de Gestion Utilisateurs**

#### **GET /api/teacher-profiles - Gestion formateurs**
```bash
# Super Admin peut voir tous les formateurs
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/teacher-profiles" -Method GET -Headers $headers
```

#### **GET /api/student-profiles - Gestion étudiants**
```bash
# Super Admin peut voir tous les étudiants
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/student-profiles" -Method GET -Headers $headers
```

### **🧪 Tests de Sécurité - Admin Normal vs Super Admin**

#### **Test 1: Admin normal tente d'accéder aux routes privilégiées**
```bash
# 1. Connexion admin normal
$headers = @{ "Content-Type" = "application/json" }
$body = '{"email":"admin-normal@epg.ma","password":"password123"}'
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method POST -Headers $headers -Body $body
$normalToken = $response.token

# 2. Tentative d'accès (doit échouer)
$headers = @{ "Authorization" = "Bearer $normalToken"; "Content-Type" = "application/json" }
try {
    Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles" -Method GET -Headers $headers
    echo "❌ SÉCURITÉ COMPROMISE !"
} catch {
    echo "✅ SÉCURITÉ OK - Accès refusé: $($_.Exception.Message)"
}
```

#### **Test 2: Protection auto-suppression Super Admin**
```bash
# Super Admin tente de se supprimer (doit échouer)
$token = "VOTRE_SUPER_ADMIN_TOKEN"
$superAdminId = 159  # Son propre ID
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
try {
    Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin-profiles/$superAdminId" -Method DELETE -Headers $headers
    echo "❌ PROTECTION ÉCHOUÉE !"
} catch {
    echo "✅ PROTECTION OK - Auto-suppression bloquée: $($_.Exception.Message)"
}
```

### **📊 Matrice de Tests Complets**

| **Route** | **Super Admin** | **Admin Normal** | **Expected Status** |
|-----------|-----------------|------------------|---------------------|
| `GET /api/admin-profiles` | ✅ 200 OK | ❌ 403 Forbidden | ✅ |
| `GET /api/admin-profiles/{id}` (autre) | ✅ 200 OK | ❌ 403 Forbidden | ✅ |
| `GET /api/admin-profiles/{id}` (soi) | ✅ 200 OK | ✅ 200 OK | ✅ |
| `PUT /api/admin-profiles/{id}` (autre) | ✅ 200 OK | ❌ 403 Forbidden | ✅ |
| `DELETE /api/admin-profiles/{id}` (normal) | ✅ 200 OK | ❌ 403 Forbidden | ✅ |
| `DELETE /api/admin-profiles/{id}` (super) | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ |
| `DELETE /api/admin-profiles/{id}` (soi) | ❌ 403 Forbidden | ❌ 403 Forbidden | ✅ |

### **🔄 Script de Test Automatisé**

#### **test_super_admin.ps1**
```powershell
# Script PowerShell pour tester toutes les fonctionnalités Super Admin
param(
    [string]$BaseUrl = "http://127.0.0.1:8000/api",
    [string]$SuperAdminEmail = "admin@epg.ma",
    [string]$SuperAdminPassword = "admin2025"
)

Write-Host "🔱 DÉBUT DES TESTS SUPER ADMIN" -ForegroundColor Cyan

# 1. Connexion Super Admin
Write-Host "`n1️⃣ Test de connexion Super Admin..." -ForegroundColor Yellow
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    email = $SuperAdminEmail
    password = $SuperAdminPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/login" -Method POST -Headers $headers -Body $body
    $superToken = $response.token
    Write-Host "✅ Connexion réussie - Token obtenu" -ForegroundColor Green
} catch {
    Write-Host "❌ Échec de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Test accès liste admin
Write-Host "`n2️⃣ Test accès liste des admins..." -ForegroundColor Yellow
$authHeaders = @{ 
    "Authorization" = "Bearer $superToken"
    "Content-Type" = "application/json" 
}

try {
    $admins = Invoke-RestMethod -Uri "$BaseUrl/admin-profiles" -Method GET -Headers $authHeaders
    Write-Host "✅ Accès autorisé - $($admins.Count) admin(s) trouvé(s)" -ForegroundColor Green
} catch {
    Write-Host "❌ Accès refusé: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test protection auto-suppression
Write-Host "`n3️⃣ Test protection auto-suppression..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BaseUrl/admin-profiles/159" -Method DELETE -Headers $authHeaders
    Write-Host "❌ ALERTE: Auto-suppression possible !" -ForegroundColor Red
} catch {
    Write-Host "✅ Protection OK - Auto-suppression bloquée" -ForegroundColor Green
}

Write-Host "`n🎉 TESTS SUPER ADMIN TERMINÉS" -ForegroundColor Cyan
```

**Utilisation :**
```bash
# Exécuter le script de test
powershell -ExecutionPolicy Bypass -File test_super_admin.ps1
```

---

## 📞 **CONTACT D'URGENCE**

En cas de perte d'accès au Super Admin :

### **Récupération d'urgence :**
```bash
# Créer un nouveau Super Admin d'urgence
php artisan admin:create-super urgence@epg.ma "Admin Urgence" "UrgenceSecure2025"

# Ou réactiver un compte existant
php artisan tinker --execute="
    \$user = \App\Models\User::where('email', 'backup@epg.ma')->first();
    if(\$user) {
        \$user->is_super_admin = true;
        \$user->save();
        echo 'Compte de secours activé';
    }
"
```

---

## 📚 **HISTORIQUE DES MODIFICATIONS**

| **Date** | **Action** | **Détails** |
|----------|------------|-------------|
| **25/07/2025** | Création Super Admin initial | Email: admin@epg.ma, Nom: Fatine |
| **25/07/2025** | Ajout profil admin manquant | Profil ID: 17, Spécialité: Super Administration |
| **25/07/2025** | Documentation complète | Guide création et identifiants |

---

**⚠️ IMPORTANT : Gardez ce fichier dans un endroit sécurisé et ne le partagez jamais publiquement !** 🔒

**📝 Dernière mise à jour : 25 juillet 2025** ✨
