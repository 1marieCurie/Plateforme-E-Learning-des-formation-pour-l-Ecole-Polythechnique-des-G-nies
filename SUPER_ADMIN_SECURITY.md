# 🔐 SÉCURITÉ ADMIN - SYSTÈME HIÉRARCHIQUE SUPER ADMIN

## 🎯 **PROBLÈMES IDENTIFIÉS ET SOLUTIONS**

### ❌ **Problèmes détectés :**
1. **Admin peut supprimer d'autres admins** - Chaos possible
2. **Pas de hiérarchie Super Admin** - Aucun contrôle suprême
3. **Suppression partielle** - Profil supprimé mais utilisateur reste
4. **Pas de protection contre l'auto-suppression**

### ✅ **Solutions implémentées :**
1. **Système Super Admin** - Hiérarchie claire
2. **Protection anti-suppression** - Auto-protection + protection inter-Super Admin
3. **Suppression complète** - Utilisateur ET profil supprimés
4. **Middleware dédié** - Contrôle d'accès centralisé

---

## 🏗️ **ARCHITECTURE HIÉRARCHIQUE**

```
🔱 SUPER ADMIN (is_super_admin = true)
├── Peut tout faire sur tous les admins normaux
├── Peut créer/modifier/supprimer des admins
├── Peut créer des formateurs et étudiants
├── Ne peut PAS supprimer d'autres Super Admins
└── Ne peut PAS s'auto-supprimer

 ADMIN NORMAL (role = 'admin', is_super_admin = false)
├── Peut gérer les formateurs et étudiants
├── Peut voir son propre profil
├── Peut modifier son propre profil
└── Ne peut PAS gérer d'autres admins
```

---

## 🔧 **CORRECTIONS APPLIQUÉES**

### 1. **Champ Super Admin ajouté**
```sql
-- Migration déjà exécutée
ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
```

### 2. **User Model mis à jour**
```php
// app/Models/User.php
protected $fillable = [
    'nom', 'email', 'password', 'tel', 'indicatif', 
    'ville', 'villeOrigine', 'naissance', 'role',
    'is_super_admin'  // ✅ Ajouté
];

protected function casts(): array {
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_super_admin' => 'boolean'  // ✅ Ajouté
    ];
}
```

### 3. **AdminProfileController sécurisé**

#### 📋 **Méthode index() - Liste des admins**
```php
public function index(Request $request) {
    $currentUser = $request->user();
    
    // 🔒 SÉCURITÉ : Seuls les Super Admins peuvent voir tous les profils admin
    if (!$currentUser->is_super_admin) {
        return response()->json(['error' => 'Accès refusé.'], 403);
    }
    // ... reste du code
}
```

#### 👤 **Méthode show() - Profil spécifique**
```php
public function show(Request $request, $user_id) {
    $currentUser = $request->user();
    
    // 🔒 SÉCURITÉ : Un admin ne peut voir que son propre profil (sauf Super Admin)
    if (!$currentUser->is_super_admin && $currentUser->id != $user_id) {
        return response()->json(['error' => 'Accès refusé.'], 403);
    }
    // ... reste du code
}
```

#### ✏️ **Méthode update() - Modification**
```php
public function update(Request $request, $user_id) {
    $currentUser = $request->user();
    
    // 🔒 SÉCURITÉ : Un admin ne peut modifier que son propre profil (sauf Super Admin)
    if (!$currentUser->is_super_admin && $currentUser->id != $user_id) {
        return response()->json(['error' => 'Accès refusé.'], 403);
    }
    // ... reste du code
}
```

#### 🗑️ **Méthode destroy() - Suppression sécurisée**
```php
public function destroy(Request $request, $user_id) {
    $currentUser = $request->user();
    
    // 🔒 SÉCURITÉ CRITIQUE : Seuls les Super Admins peuvent supprimer des admins
    if (!$currentUser->is_super_admin) {
        return response()->json(['error' => 'Accès refusé.'], 403);
    }
    
    $targetUser = User::find($user_id);
    
    // 🛡️ Protection : Empêcher l'auto-suppression du Super Admin
    if ($targetUser && $targetUser->is_super_admin && $targetUser->id === $currentUser->id) {
        return response()->json(['error' => 'Impossible de supprimer votre propre compte Super Admin.'], 403);
    }
    
    // ⚠️ Avertissement si tentative de suppression d'un autre Super Admin
    if ($targetUser && $targetUser->is_super_admin) {
        return response()->json(['error' => 'Impossible de supprimer un autre Super Admin.'], 403);
    }

    // ✅ CORRECTION : Supprimer COMPLÈTEMENT l'utilisateur (cascade le profil)
    if ($targetUser) {
        $targetUser->delete(); // Ceci supprimera aussi le profil via les contraintes FK
    }
    
    return response()->json(['message' => 'Admin supprimé avec succès (utilisateur et profil).'], 200);
}
```

---

## 🛠️ **OUTILS CRÉÉS**

### 1. **Commande Super Admin**
```bash
php artisan admin:create-super email@example.com "Super Admin" "password123"
```

**Fonctionnalités :**
- ✅ Crée un utilisateur avec `is_super_admin = true`
- ✅ Crée automatiquement le profil admin correspondant
- ✅ Vérification d'unicité de l'email
- ✅ Transaction sécurisée (rollback en cas d'erreur)

### 2. **Middleware SuperAdminMiddleware**
```php
// Utilisation dans les routes
Route::middleware(['auth:api', 'super.admin'])->group(function () {
    Route::delete('/admin-profiles/{user_id}', [AdminProfileController::class, 'destroy']);
    Route::get('/admin-profiles', [AdminProfileController::class, 'index']);
});
```

---

## 🎯 **MATRICE DES PERMISSIONS ADMIN**

| Action | Admin Normal | Super Admin |
|--------|--------------|-------------|
| **Voir tous les admins** | ❌ | ✅ |
| **Voir son propre profil** | ✅ | ✅ |
| **Voir profil autre admin** | ❌ | ✅ |
| **Modifier son profil** | ✅ | ✅ |
| **Modifier autre admin** | ❌ | ✅ |
| **Supprimer admin normal** | ❌ | ✅ |
| **Supprimer Super Admin** | ❌ | ❌ |
| **S'auto-supprimer** | ❌ | ❌ |
| **Créer nouveaux admins** | ❌ | ✅ |
| **Gérer formateurs** | ✅ | ✅ |
| **Gérer étudiants** | ✅ | ✅ |

---

## 🧪 **TESTS DE SÉCURITÉ**

### Test 1: Admin normal tente de voir tous les admins
```bash
# Se connecter comme admin normal
POST /api/login
{
    "email": "admin-normal@epg.ma",
    "password": "password"
}

# ❌ Doit échouer
GET /api/admin-profiles
# Résultat attendu: 403 Forbidden
```

### Test 2: Super Admin peut tout faire
```bash
# Se connecter comme Super Admin
POST /api/login
{
    "email": "admin@epg.ma",
    "password": "admin2025"
}

# ✅ Doit réussir
GET /api/admin-profiles
GET /api/admin-profiles/123
PUT /api/admin-profiles/123
DELETE /api/admin-profiles/123
```

### Test 3: Protection auto-suppression
```bash
# Super Admin tente de se supprimer lui-même
DELETE /api/admin-profiles/{son_propre_id}
# Résultat attendu: 403 avec message "Impossible de supprimer votre propre compte Super Admin"
```

### Test 4: Protection inter-Super Admin
```bash
# Super Admin A tente de supprimer Super Admin B
DELETE /api/admin-profiles/{autre_super_admin_id}
# Résultat attendu: 403 avec message "Impossible de supprimer un autre Super Admin"
```

---

## 💾 **CORRECTION DE LA SUPPRESSION**

### Problème détecté :
```php
// ❌ AVANT : Suppression partielle
$profile->delete(); // Seul le profil était supprimé
```

### Solution appliquée :
```php
// ✅ APRÈS : Suppression complète
if ($targetUser) {
    $targetUser->delete(); // Supprime l'utilisateur ET le profil (cascade FK)
} else {
    $profile->delete(); // Fallback si l'utilisateur n'existe plus
}
```

---

## 🚀 **ÉTAPES DE MISE EN PLACE**

### 1. **Créer le Super Admin initial**
```bash
php artisan admin:create-super admin@epg.ma "Super Admin" "SuperSecretPassword2025"
```

### 2. **Transformer un admin existant**
```sql
UPDATE users SET is_super_admin = true WHERE email = 'admin@epg.ma';
```

### 3. **Tester les permissions**
- Se connecter comme Super Admin
- Tester toutes les routes admin
- Se connecter comme admin normal
- Vérifier les restrictions

---

## ✅ **AVANTAGES DU SYSTÈME**

1. **🔒 Sécurité renforcée** : Hiérarchie claire des privilèges
2. **🛡️ Protection système** : Impossible de détruire tous les admins
3. **📊 Traçabilité** : Actions sensibles réservées aux Super Admins
4. **🎯 Flexibilité** : Super Admin peut déléguer sans risquer le système
5. **⚡ Performance** : Middleware optimisé pour les vérifications

**Votre système admin est maintenant sécurisé avec une hiérarchie Super Admin ! 🔱✨**
