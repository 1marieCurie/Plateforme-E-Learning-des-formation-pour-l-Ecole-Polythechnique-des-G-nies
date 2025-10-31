# 🔒 CORRECTIONS DE SÉCURITÉ - PROFILS ÉTUDIANTS

## ❌ **PROBLÈMES IDENTIFIÉS ET CORRIGÉS**

### 1. **Faille de sécurité majeure : Accès libre aux profils**
**Avant :** N'importe quel étudiant pouvait voir/modifier/supprimer tous les autres profils
**Après :** Contrôle d'accès basé sur les rôles (RBAC)

### 2. **Bug logique dans la suppression**
**Avant :** `StudentProfile::find($user_id)` cherchait par ID de profil au lieu de user_id
**Après :** `StudentProfile::where('user_id', $user_id)->first()` cherche correctement

### 3. **Incohérence des permissions**
**Avant :** Aucune vérification de propriétaire ou de rôle
**Après :** Vérifications strictes selon le rôle et la propriété

---

## ✅ **NOUVELLES RÈGLES DE SÉCURITÉ APPLIQUÉES**

### 📋 **GET /api/student-profiles** (Liste tous les profils)
- **Avant :** ❌ Accessible à tous les utilisateurs authentifiés
- **Après :** ✅ Accès limité aux **admin** et **formateur** uniquement
- **Code de sécurité :**
```php
if (!in_array($user->role, ['admin', 'formateur'])) {
    return response()->json(['error' => 'Accès refusé. Permissions insuffisantes.'], 403);
}
```

### 👤 **GET /api/student-profiles/{user_id}** (Profil spécifique)
- **Avant :** ❌ N'importe qui peut voir n'importe quel profil
- **Après :** ✅ Un étudiant ne peut voir que **son propre profil**
- **Code de sécurité :**
```php
if ($currentUser->role === 'etudiant' && $currentUser->id != $user_id) {
    return response()->json(['error' => 'Accès refusé. Vous ne pouvez consulter que votre propre profil.'], 403);
}
```

### ✏️ **PUT /api/student-profiles/{user_id}** (Modification)
- **Avant :** ❌ N'importe qui peut modifier n'importe quel profil
- **Après :** ✅ Un étudiant ne peut modifier que **son propre profil**
- **Code de sécurité :**
```php
if ($currentUser->role === 'etudiant' && $currentUser->id != $user_id) {
    return response()->json(['error' => 'Accès refusé. Vous ne pouvez modifier que votre propre profil.'], 403);
}
```

### 🗑️ **DELETE /api/student-profiles/{user_id}** (Suppression)
- **Avant :** ❌ N'importe qui peut supprimer n'importe quel profil
- **Après :** ✅ **Administrateurs uniquement** peuvent supprimer
- **Fix du bug :** Recherche correcte par `user_id`
- **Code de sécurité :**
```php
if ($currentUser->role !== 'admin') {
    return response()->json(['error' => 'Accès refusé. Seuls les administrateurs peuvent supprimer des profils.'], 403);
}

// ✅ CORRECTION DU BUG : Recherche par user_id, pas par ID de profil
$profile = StudentProfile::where('user_id', $user_id)->first();
```

### 🔒 **GET /api/my-student-profile** (Nouvelle route sécurisée)
- **Nouvelle fonctionnalité :** Route dédiée pour que l'étudiant consulte son propre profil
- **Sécurité :** Accessible uniquement aux utilisateurs avec role `etudiant`
- **Avantage :** Plus simple à utiliser côté frontend (pas besoin de passer l'ID)

---

## 🎯 **MATRICE DES PERMISSIONS**

| Route | Étudiant | Formateur | Admin |
|-------|----------|-----------|-------|
| `GET /student-profiles` | ❌ | ✅ | ✅ |
| `GET /student-profiles/{id}` | ✅ (sien uniquement) | ✅ | ✅ |
| `PUT /student-profiles/{id}` | ✅ (sien uniquement) | ✅ | ✅ |
| `DELETE /student-profiles/{id}` | ❌ | ❌ | ✅ |
| `GET /my-student-profile` | ✅ | ❌ | ❌ |

---

## 🧪 **TESTS RECOMMANDÉS**

### Test 1: Sécurité étudiant
```bash
# Se connecter comme étudiant (ID 1)
POST /api/login
{
    "email": "etudiant@epg.ma",
    "password": "etudiant2025"
}

# ❌ Doit échouer : Tenter de voir tous les profils
GET /api/student-profiles
# Résultat attendu: 403 Forbidden

# ❌ Doit échouer : Tenter de voir le profil d'un autre (ID 2)
GET /api/student-profiles/2
# Résultat attendu: 403 Forbidden

# ✅ Doit réussir : Voir son propre profil
GET /api/student-profiles/1
GET /api/my-student-profile
# Résultat attendu: 200 OK avec ses données

# ❌ Doit échouer : Tenter de supprimer un profil
DELETE /api/student-profiles/2
# Résultat attendu: 403 Forbidden
```

### Test 2: Sécurité formateur
```bash
# Se connecter comme formateur
POST /api/login
{
    "email": "formateur@epg.ma",
    "password": "formateur2025"
}

# ✅ Doit réussir : Voir tous les profils
GET /api/student-profiles
# Résultat attendu: 200 OK avec liste complète

# ✅ Doit réussir : Voir n'importe quel profil
GET /api/student-profiles/1
# Résultat attendu: 200 OK

# ❌ Doit échouer : Supprimer un profil (seuls les admins)
DELETE /api/student-profiles/1
# Résultat attendu: 403 Forbidden
```

### Test 3: Sécurité admin
```bash
# Se connecter comme admin
POST /api/login
{
    "email": "admin@epg.ma", 
    "password": "admin2025"
}

# ✅ Doit réussir : Toutes les opérations
GET /api/student-profiles
GET /api/student-profiles/1
PUT /api/student-profiles/1
DELETE /api/student-profiles/1
# Résultat attendu: 200 OK pour toutes
```

---

## 🔧 **CORRECTIONS DU BUG DE SUPPRESSION**

### Problème détecté :
```php
// ❌ AVANT : Bug - cherchait par ID de profil
$profile = StudentProfile::find($user_id);
```

### Solution appliquée :
```php
// ✅ APRÈS : Correct - cherche par user_id
$profile = StudentProfile::where('user_id', $user_id)->first();
```

### Pourquoi ce bug se produisait :
1. **Route :** `DELETE /api/student-profiles/{user_id}` (user_id = 1)
2. **Bug :** `StudentProfile::find(1)` cherchait le profil avec ID=1 
3. **Problème :** L'ID du profil peut être différent de l'user_id
4. **Résultat :** Suppression du mauvais profil ou erreur 404

### Vérification de la cascade :
- La suppression du profil **ne supprime PAS** l'utilisateur (intentionnel)
- Pour supprimer complètement l'utilisateur, décommentez : `$user->delete();`
- Avec les contraintes FK, supprimer l'utilisateur supprimera automatiquement son profil

---

## 🚀 **RECOMMANDATIONS FUTURES**

1. **Middleware personnalisé :** Créer un middleware pour vérifier les rôles
2. **Logs de sécurité :** Enregistrer les tentatives d'accès non autorisé
3. **Rate limiting :** Limiter les tentatives de modification
4. **Audit trail :** Tracer qui modifie quoi et quand

---

## ✅ **RÉSUMÉ DES AMÉLIORATIONS**

- **🔒 Sécurité renforcée :** Contrôle d'accès basé sur les rôles
- **🐛 Bug corrigé :** Suppression par user_id fonctionnelle
- **🎯 Route dédiée :** `/my-student-profile` pour les étudiants
- **📊 Permissions claires :** Matrice de droits bien définie
- **🧪 Tests prêts :** Scénarios de validation fournis

**Votre API est maintenant sécurisée et les permissions sont correctement appliquées ! 🛡️**
