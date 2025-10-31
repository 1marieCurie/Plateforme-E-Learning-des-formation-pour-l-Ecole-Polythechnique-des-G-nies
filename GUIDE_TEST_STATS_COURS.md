# Guide de Test - Statistiques des Cours

## 🧪 Tests Backend

### 1. Test via Script PHP
```bash
php test_courses_api.php
```

**Résultat attendu**:
- Total cours: 11
- Cours actifs: 11
- Total inscriptions: 26

### 2. Test via API directe

#### A. Obtenir un token d'authentification
```bash
# Avec PowerShell
$body = @{
    email = "votre-email@example.com"
    password = "votre-password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.access_token
```

#### B. Appeler l'API /courses
```bash
# Avec PowerShell
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
}

$courses = Invoke-RestMethod -Uri "http://localhost:8000/api/courses" -Method Get -Headers $headers
$courses.data.Count  # Devrait afficher 11
```

#### C. Avec cURL (si installé)
```bash
curl -X GET "http://localhost:8000/api/courses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### 3. Test avec Postman / Insomnia

**Endpoint**: `GET http://localhost:8000/api/courses`

**Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/json
Content-Type: application/json
```

**Réponse attendue**:
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "Laravel",
      "description": "...",
      "avgProgress": 0,
      "avgScore": 0,
      "views": 0,
      "category": {
        "id": 1,
        "nom": "Développement Web"
      },
      "formation": {
        "id": 2,
        "title": "Backend",
        "enrolled_students": 3
      }
    }
    // ... 10 autres cours
  ]
}
```

**Vérifications**:
- ✅ `data` doit contenir **11 éléments**
- ✅ Chaque cours doit avoir `formation.enrolled_students`
- ✅ Chaque cours doit avoir `avgProgress`
- ✅ `success` doit être `true`

## 🎨 Tests Frontend

### 1. Démarrer le serveur Laravel
```bash
cd c:\Users\J.P.M\epg-plateforme
php artisan serve
```

### 2. Démarrer le frontend React
```bash
cd frontend
npm run dev
# ou
npm start
```

### 3. Accéder à la page des statistiques
1. Se connecter avec un compte **admin**
2. Naviguer vers **Dashboard > Statistiques > Statistiques des Cours**
3. Vérifier que la page affiche **11 cours** et non 25

### 4. Vérifications visuelles

#### A. Vue d'ensemble (en haut de page)
- [ ] **Total des cours**: doit afficher `11`
- [ ] **Inscriptions totales**: doit afficher `26` (ou proche)
- [ ] **Taux de réussite**: calcul dynamique (peut être 0 si pas de progression)

#### B. Statistiques détaillées
- [ ] **Cours actifs**: 11
- [ ] **Note moyenne générale**: valeur depuis l'API feedbacks
- [ ] **Vues totales**: `--` (non disponible)
- [ ] **Croissance inscriptions**: `--` (non disponible)

#### C. Cours les plus populaires (Top 5)
Devrait afficher les 5 cours avec le plus d'inscrits:
1. Laravel (3 étudiants)
2. PHP (3 étudiants)
3. Scripts Shell (3 étudiants)
4. cours 4 (3 étudiants)
5. cours 5 (3 étudiants)

#### D. Performance par catégorie
- [ ] Développement Web: 7 cours
- [ ] Dessin Technique & Multimedia: 2 cours
- [ ] Autres catégories: 1 cours chacune

### 5. Tests de la console navigateur

Ouvrir la console (F12) et vérifier:

```javascript
// Pas d'erreurs de type:
// ❌ Failed to fetch
// ❌ 404 Not Found
// ❌ 500 Internal Server Error

// Messages attendus:
// ✅ API call to /courses successful
```

### 6. Test du Network Tab (F12 > Network)

Filtrer par `courses`:

**Request**:
```
GET /api/courses
Status: 200 OK
```

**Response Preview**:
```json
{
  "success": true,
  "data": [...] // 11 éléments
}
```

## 🐛 Debugging

### Si vous voyez toujours 25 cours

1. **Vider le cache du navigateur**
   ```
   Ctrl + Shift + Delete
   Cocher "Cached images and files"
   ```

2. **Forcer le rechargement**
   ```
   Ctrl + F5
   ```

3. **Vérifier la console**
   - Y a-t-il des erreurs API ?
   - Le token d'authentification est-il valide ?

4. **Vérifier le backend**
   ```bash
   # Logs Laravel
   tail -f storage/logs/laravel.log
   ```

5. **Tester l'API manuellement**
   ```bash
   php test_courses_api.php
   ```

### Si l'API retourne une erreur 500

1. **Vérifier les logs Laravel**
   ```bash
   cat storage/logs/laravel.log
   ```

2. **Vérifier la connexion à la base de données**
   ```bash
   php artisan tinker
   >>> DB::table('courses')->count()
   >>> # Devrait retourner 11
   ```

3. **Vérifier les relations dans le model**
   ```bash
   php artisan tinker
   >>> $course = App\Models\Course::find(2)
   >>> $course->formation
   >>> $course->category
   ```

### Si l'API retourne une erreur 401 (Unauthorized)

1. **Token expiré**: Se reconnecter
2. **Token invalide**: Vérifier le header Authorization
3. **Middleware auth:api**: Vérifier que le middleware est actif

### Si l'API retourne un tableau vide []

1. **Pas de cours actifs**:
   ```sql
   UPDATE courses SET is_active = 1;
   ```

2. **Scope `active()` trop restrictif**: Vérifier `Course.php`

## ✅ Checklist de validation finale

Avant de considérer les corrections comme terminées:

- [ ] Backend API retourne 11 cours (via `test_courses_api.php`)
- [ ] Frontend affiche 11 dans "Total des cours"
- [ ] Aucune donnée mockée visible (pas de 25, 456, 78.5%, etc.)
- [ ] Console navigateur sans erreurs
- [ ] Network tab montre `200 OK` pour `/api/courses`
- [ ] Les statistiques d'inscriptions sont correctes (26 total)
- [ ] Les catégories affichent les bons nombres
- [ ] Top 5 cours affiche les vrais cours de la BDD

## 📊 Données de référence

**Attendu après corrections**:

| Métrique | Valeur |
|----------|--------|
| Total cours | 11 |
| Cours actifs | 11 |
| Total inscriptions | 26 |
| Cours avec chapitres | 5 |
| Total chapitres | 7 |
| Catégorie principale | Développement Web (7 cours) |

## 🆘 Besoin d'aide ?

Si les tests échouent:

1. Vérifier que le serveur Laravel est démarré (`php artisan serve`)
2. Vérifier que vous êtes connecté en tant qu'admin
3. Consulter `CORRECTION_STATS_COURS.md` pour les détails des corrections
4. Vérifier les fichiers modifiés:
   - `routes/api.php`
   - `app/Http/Controllers/CourseController.php`
   - `frontend/src/components/Admin/Stats_Tech/CourseStats.jsx`

---

**Dernière mise à jour**: Aujourd'hui
**Version**: 1.0
