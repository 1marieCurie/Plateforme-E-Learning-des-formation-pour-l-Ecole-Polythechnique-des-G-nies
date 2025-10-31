# 📊 INVENTAIRE DES DONNÉES - USER ACTIVITY STATS

## Date: 17 Octobre 2025

---

## ✅ DONNÉES DISPONIBLES DANS LA BASE DE DONNÉES

### 1. **Overview - Utilisateurs**

| Donnée Mockée | Attribut Réel Disponible | Table | Notes |
|---------------|-------------------------|-------|-------|
| `totalUsers` | ✅ `COUNT(*)` | `users` | Total de tous les utilisateurs |
| `activeUsers` | ⚠️ `last_login_at` | `student_profiles`, `teacher_profiles`, `admin_profiles` | Nécessite définition de "actif" (ex: connecté dans les 30 derniers jours) |
| `newUsers` | ✅ `created_at` | `users` | Filtre WHERE `created_at >= DATE_SUB(NOW(), INTERVAL X DAY)` |
| `returningUsers` | ⚠️ Calculable via sessions | `sessions` | Compter users avec > 1 session |
| `dailyActiveUsers` | ⚠️ `last_login_at` + date du jour | profiles | WHERE `DATE(last_login_at) = CURDATE()` |

**SQL Exemples:**
```sql
-- Total Users
SELECT COUNT(*) FROM users;

-- New Users (derniers 7 jours)
SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Active Users (connectés dans les 30 derniers jours)
SELECT COUNT(DISTINCT user_id) FROM (
    SELECT user_id FROM student_profiles WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    UNION
    SELECT user_id FROM teacher_profiles WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    UNION
    SELECT user_id FROM admin_profiles WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
) AS active_users;

-- Daily Active Users
SELECT COUNT(DISTINCT user_id) FROM (
    SELECT user_id FROM student_profiles WHERE DATE(last_login_at) = CURDATE()
    UNION
    SELECT user_id FROM teacher_profiles WHERE DATE(last_login_at) = CURDATE()
    UNION
    SELECT user_id FROM admin_profiles WHERE DATE(last_login_at) = CURDATE()
) AS daily_active;
```

---

### 2. **Connections - Sessions**

| Donnée Mockée | Attribut Réel Disponible | Table | Notes |
|---------------|-------------------------|-------|-------|
| `totalConnections` | ✅ `COUNT(*)` | `sessions` | Nombre total de sessions |
| `uniqueConnections` | ✅ `COUNT(DISTINCT user_id)` | `sessions` | Utilisateurs uniques ayant des sessions |
| `avgConnectionsPerUser` | ✅ Calculable | `sessions` | `totalConnections / uniqueConnections` |
| `peakHour` | ✅ `last_activity` | `sessions` | Convertir timestamp et grouper par heure |
| `connectionsByHour` | ✅ `last_activity` | `sessions` | Grouper par `HOUR(FROM_UNIXTIME(last_activity))` |

**Structure Table Sessions:**
```php
'sessions' => [
    'id' => string (primary),
    'user_id' => foreignId (nullable, indexed),
    'ip_address' => string(45, nullable),
    'user_agent' => text (nullable),
    'payload' => longText,
    'last_activity' => integer (indexed) // Timestamp UNIX
]
```

**SQL Exemples:**
```sql
-- Total Connections
SELECT COUNT(*) FROM sessions;

-- Unique Connections
SELECT COUNT(DISTINCT user_id) FROM sessions WHERE user_id IS NOT NULL;

-- Peak Hour (dernières 24h)
SELECT 
    HOUR(FROM_UNIXTIME(last_activity)) AS hour,
    COUNT(*) AS connections
FROM sessions
WHERE last_activity >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))
GROUP BY HOUR(FROM_UNIXTIME(last_activity))
ORDER BY connections DESC
LIMIT 1;

-- Connections By Hour (dernières 24h)
SELECT 
    HOUR(FROM_UNIXTIME(last_activity)) AS hour,
    COUNT(*) AS connections
FROM sessions
WHERE last_activity >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR))
GROUP BY HOUR(FROM_UNIXTIME(last_activity))
ORDER BY hour;
```

---

### 3. **Top Active Users**

| Donnée Mockée | Attribut Réel Disponible | Table | Notes |
|---------------|-------------------------|-------|-------|
| `name` | ✅ `nom` | `users` | Nom de l'utilisateur |
| `sessionsCount` | ✅ `COUNT(sessions.id)` | `sessions` | Compter sessions par user_id |
| `lastSeen` | ✅ `last_login_at` | profiles | Dernière connexion depuis profiles |

**SQL Exemple:**
```sql
-- Top 5 Most Active Users (par nombre de sessions)
SELECT 
    u.nom,
    u.email,
    COUNT(s.id) AS sessions_count,
    COALESCE(sp.last_login_at, tp.last_login_at, ap.last_login_at) AS last_seen
FROM users u
LEFT JOIN sessions s ON s.user_id = u.id
LEFT JOIN student_profiles sp ON sp.user_id = u.id
LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
LEFT JOIN admin_profiles ap ON ap.user_id = u.id
WHERE s.user_id IS NOT NULL
GROUP BY u.id
ORDER BY sessions_count DESC
LIMIT 5;
```

---

### 4. **User Information (Profils)**

| Donnée | Table | Colonne | Notes |
|--------|-------|---------|-------|
| Nom | `users` | `nom` | ✅ Disponible |
| Email | `users` | `email` | ✅ Disponible |
| Téléphone | `users` | `tel`, `indicatif` | ✅ Disponible |
| Ville | `users` | `ville` | ✅ Disponible |
| Date de naissance | `users` | `naissance` | ✅ Disponible |
| Rôle | `users` | `role` | ✅ enum('etudiant', 'formateur', 'admin', 'super_admin') |
| Date création | `users` | `created_at` | ✅ Disponible |
| Dernière connexion | profiles | `last_login_at` | ✅ Disponible dans student_profiles, teacher_profiles, admin_profiles |

---

## ❌ DONNÉES NON DISPONIBLES (Nécessitent nouvelles migrations)

### 1. **Session Duration - Durée de Session**

| Donnée Mockée | Besoin | Solution |
|---------------|--------|----------|
| `avgSessionDuration` | Temps moyen passé par session | ❌ **MANQUANT** - Nécessite tracking des durées |
| `totalTime` | Temps total cumulé par utilisateur | ❌ **MANQUANT** |

**Solution Proposée:**
- Ajouter une colonne `duration` dans la table `sessions`
- OU créer une table `user_activity_logs` pour tracker les durées de session

```php
// Nouvelle migration suggérée
Schema::table('sessions', function (Blueprint $table) {
    $table->integer('duration')->nullable()->after('last_activity'); // Durée en secondes
    $table->timestamp('started_at')->nullable()->after('last_activity');
});
```

---

### 2. **Devices - Type d'Appareil**

| Donnée Mockée | Besoin | Solution |
|---------------|--------|----------|
| `desktop` (60%) | Pourcentage desktop | ⚠️ **PARTIELLEMENT DISPONIBLE** via parsing `user_agent` |
| `mobile` (35%) | Pourcentage mobile | ⚠️ **PARTIELLEMENT DISPONIBLE** via parsing `user_agent` |
| `tablet` (5%) | Pourcentage tablette | ⚠️ **PARTIELLEMENT DISPONIBLE** via parsing `user_agent` |

**Solution Proposée:**
- Parser le champ `user_agent` côté backend (package Laravel: `jenssegers/agent`)
- OU ajouter une colonne `device_type` dans la table `sessions`

```php
// Utiliser Laravel Agent Package
use Jenssegers\Agent\Agent;

$agent = new Agent();
$agent->setUserAgent($request->header('User-Agent'));

if ($agent->isDesktop()) {
    $deviceType = 'desktop';
} elseif ($agent->isTablet()) {
    $deviceType = 'tablet';
} elseif ($agent->isMobile()) {
    $deviceType = 'mobile';
}
```

**OU Nouvelle migration:**
```php
Schema::table('sessions', function (Blueprint $table) {
    $table->enum('device_type', ['desktop', 'mobile', 'tablet', 'unknown'])
          ->default('unknown')
          ->after('user_agent');
});
```

---

### 3. **Detailed Activity Tracking**

| Donnée Mockée | Besoin | Disponibilité |
|---------------|--------|---------------|
| Activité temps réel | Savoir qui est connecté maintenant | ⚠️ Partiellement via `sessions.last_activity` |
| Historique complet | Log de toutes les actions | ❌ **MANQUANT** |
| Pages visitées | Tracking navigation | ❌ **MANQUANT** |

**Solution Proposée:**
Créer une nouvelle table `user_activity_logs`:

```php
Schema::create('user_activity_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->string('action_type'); // login, logout, page_view, course_access, etc.
    $table->string('page_url')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->enum('device_type', ['desktop', 'mobile', 'tablet', 'unknown'])->default('unknown');
    $table->json('metadata')->nullable(); // Données supplémentaires
    $table->timestamp('created_at');
    
    $table->index(['user_id', 'created_at']);
    $table->index('action_type');
});
```

---

## 📋 RÉSUMÉ RAPIDE

### ✅ **DONNÉES DISPONIBLES IMMÉDIATEMENT:**
1. ✅ Total utilisateurs
2. ✅ Nouveaux utilisateurs (par période)
3. ✅ Nombre de sessions
4. ✅ Connexions uniques
5. ✅ Pic d'activité par heure (via `last_activity`)
6. ✅ Top utilisateurs actifs (par nb sessions)
7. ✅ Dernière connexion (`last_login_at`)
8. ✅ Informations utilisateur (nom, email, rôle)

### ⚠️ **DONNÉES PARTIELLEMENT DISPONIBLES (Nécessitent traitement):**
1. ⚠️ Utilisateurs actifs (définir critère temporel)
2. ⚠️ Type d'appareil (parser `user_agent`)
3. ⚠️ Connexions par heure (convertir timestamps UNIX)

### ❌ **DONNÉES MANQUANTES (Nécessitent nouvelles tables/colonnes):**
1. ❌ Durée moyenne de session
2. ❌ Temps total cumulé par utilisateur
3. ❌ Type d'appareil stocké directement
4. ❌ Historique détaillé d'activité
5. ❌ Pages visitées / Navigation tracking

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase 1: **Utiliser les données existantes** (Immédiat)
```bash
# Créer contrôleur API pour statistiques d'activité
php artisan make:controller Api/Admin/UserActivityStatsController
```

Endpoints à créer:
- `GET /api/admin/stats/user-activity/overview` → Total users, new users, active users
- `GET /api/admin/stats/user-activity/connections` → Sessions stats, peak hours
- `GET /api/admin/stats/user-activity/top-users` → Most active users

### Phase 2: **Améliorer le tracking** (Court terme)
1. Ajouter colonnes `duration` et `started_at` à `sessions`
2. Ajouter colonne `device_type` à `sessions`
3. Parser `user_agent` lors de la création de session

### Phase 3: **Tracking avancé** (Moyen terme)
1. Créer table `user_activity_logs`
2. Implémenter middleware de logging d'activité
3. Créer système d'analytics temps réel

---

## 🔧 EXEMPLE D'IMPLÉMENTATION BACKEND

```php
// app/Http/Controllers/Api/Admin/UserActivityStatsController.php

public function overview(Request $request)
{
    $timeRange = $request->get('timeRange', 7); // Défaut: 7 jours
    
    $stats = [
        'totalUsers' => User::count(),
        'activeUsers' => $this->getActiveUsersCount($timeRange),
        'newUsers' => User::where('created_at', '>=', now()->subDays($timeRange))->count(),
        'dailyActiveUsers' => $this->getDailyActiveUsersCount(),
    ];
    
    return response()->json($stats);
}

private function getActiveUsersCount($days)
{
    $threshold = now()->subDays($days);
    
    return DB::table('users')->whereExists(function($query) use ($threshold) {
        $query->select(DB::raw(1))
              ->from('sessions')
              ->whereColumn('sessions.user_id', 'users.id')
              ->where('sessions.last_activity', '>=', $threshold->timestamp);
    })->count();
}

public function connections(Request $request)
{
    $timeRange = $request->get('timeRange', 24); // Défaut: 24 heures
    
    $stats = [
        'totalConnections' => Session::where('last_activity', '>=', now()->subHours($timeRange)->timestamp)->count(),
        'uniqueConnections' => Session::whereNotNull('user_id')
                                      ->where('last_activity', '>=', now()->subHours($timeRange)->timestamp)
                                      ->distinct('user_id')
                                      ->count('user_id'),
        'connectionsByHour' => $this->getConnectionsByHour($timeRange),
        'peakHour' => $this->getPeakHour($timeRange),
    ];
    
    return response()->json($stats);
}

private function getConnectionsByHour($hours)
{
    return DB::table('sessions')
        ->select(
            DB::raw('HOUR(FROM_UNIXTIME(last_activity)) as hour'),
            DB::raw('COUNT(*) as connections')
        )
        ->where('last_activity', '>=', now()->subHours($hours)->timestamp)
        ->groupBy('hour')
        ->orderBy('hour')
        ->get();
}
```

---

## 📌 NOTES IMPORTANTES

1. **Performance:** Avec beaucoup d'utilisateurs, indexer `last_activity` dans `sessions`
2. **Nettoyage:** Mettre en place un CRON pour supprimer les vieilles sessions
3. **Cache:** Mettre en cache les statistiques (Redis) pour éviter calculs répétitifs
4. **Temps réel:** Pour du vrai temps réel, considérer Laravel Echo + WebSockets

---

**Créé le:** 17 Octobre 2025
**Auteur:** Analyse système EPG Plateforme
**Statut:** ✅ Inventaire complet réalisé
