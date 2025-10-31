<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Retourne les formateurs non-admins (role = 'formateur')
    public function nonAdmins()
    {
        $users = User::where('role', 'formateur')->get(['id', 'nom', 'email', 'role', 'created_at']);
        return response()->json($users);
    }

    /**
     * GET /api/admin/stats/user-activity
     * Retourne les statistiques d'activité utilisateur
     */
    public function getUserActivityStats(Request $request)
    {
            // Récupérer le paramètre timeRange (en jours, défaut: 7)
            $timeRangeParam = $request->get('timeRange', 7);
        
            // Extraire le nombre de jours (gère "7d" ou "7" ou 7)
            if (is_string($timeRangeParam)) {
                $timeRange = (int) preg_replace('/[^0-9]/', '', $timeRangeParam);
            } else {
                $timeRange = (int) $timeRangeParam;
            }
        
            // Défaut à 7 si invalide
            if ($timeRange <= 0) {
                $timeRange = 7;
            }

        // 1. OVERVIEW - Statistiques générales
        $totalUsers = User::count();

        $newUsers = User::where('created_at', '>=', now()->subDays($timeRange))->count();

    // Définition d'un utilisateur ACTIF: dernière connexion (last_login_at) <= 1 mois
    $activeThreshold = now()->subMonth();
    $activeThresholdTs = $activeThreshold->timestamp;

        $activeUsers = DB::table('users')
            ->where(function ($q) use ($activeThreshold, $activeThresholdTs) {
                $q->whereExists(function ($sub) use ($activeThreshold) {
                    $sub->select(DB::raw(1))
                        ->from('student_profiles')
                        ->whereColumn('student_profiles.user_id', 'users.id')
                        ->where('student_profiles.last_login_at', '>=', $activeThreshold);
                })
                ->orWhereExists(function ($sub) use ($activeThreshold) {
                    $sub->select(DB::raw(1))
                        ->from('teacher_profiles')
                        ->whereColumn('teacher_profiles.user_id', 'users.id')
                        ->where('teacher_profiles.last_login_at', '>=', $activeThreshold);
                })
                ->orWhereExists(function ($sub) use ($activeThreshold) {
                    $sub->select(DB::raw(1))
                        ->from('admin_profiles')
                        ->whereColumn('admin_profiles.user_id', 'users.id')
                        ->where('admin_profiles.last_login_at', '>=', $activeThreshold);
                })
                // Fallback: considérer aussi actif si une session récente existe (au cas où last_login_at n'est pas alimenté)
                ->orWhereExists(function ($sub) use ($activeThresholdTs) {
                    $sub->select(DB::raw(1))
                        ->from('sessions')
                        ->whereColumn('sessions.user_id', 'users.id')
                        ->where('sessions.last_activity', '>=', $activeThresholdTs);
                });
            })
            ->count();

        // Daily active users: connectés aujourd'hui
        $dailyActiveUsers = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->startOfDay()->timestamp)
            ->distinct('user_id')
            ->count('user_id');

        // 2. CONNECTIONS - Statistiques de sessions
        $totalConnections = DB::table('sessions')
            ->where('last_activity', '>=', now()->subDays($timeRange)->timestamp)
            ->count();

        $uniqueConnections = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->subDays($timeRange)->timestamp)
            ->distinct('user_id')
            ->count('user_id');

        $avgConnectionsPerUser = $uniqueConnections > 0 
            ? round($totalConnections / $uniqueConnections, 1) 
            : 0;

        // Durée moyenne de session réelle (en minutes)
        $sessionDurations = DB::table('sessions')
            ->select('user_id', DB::raw('MIN(last_activity) as min_activity'), DB::raw('MAX(last_activity) as max_activity'))
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->subDays($timeRange)->timestamp)
            ->groupBy('user_id')
            ->get()
            ->map(function($row) {
                return ($row->max_activity - $row->min_activity) / 60; // minutes
            });
        $avgSessionDuration = $sessionDurations->count() > 0
            ? round($sessionDurations->avg(), 1)
            : null;

        // Peak Hour - Heure de pic dans les dernières 24h
        $peakHourData = DB::table('sessions')
            ->select(
                DB::raw('HOUR(FROM_UNIXTIME(last_activity)) as hour'),
                DB::raw('COUNT(*) as connections')
            )
            ->where('last_activity', '>=', now()->subHours(24)->timestamp)
            ->groupBy('hour')
            ->orderBy('connections', 'desc')
            ->first();

        $peakHour = $peakHourData 
            ? sprintf('%02d:00-%02d:00', $peakHourData->hour, $peakHourData->hour + 1)
            : '00:00-01:00';

        // Connections by Hour - Dernières 24 heures
        $connectionsByHour = DB::table('sessions')
            ->select(
                DB::raw('HOUR(FROM_UNIXTIME(last_activity)) as hour'),
                DB::raw('COUNT(*) as connections')
            )
            ->where('last_activity', '>=', now()->subHours(24)->timestamp)
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
                    'connections' => $item->connections
                ];
            });

        // Remplir les heures manquantes avec 0 connexions
        $allHours = [];
        for ($i = 0; $i < 24; $i++) {
            $hourStr = sprintf('%02d:00', $i);
            $found = $connectionsByHour->firstWhere('hour', $hourStr);
            $allHours[] = [
                'hour' => $hourStr,
                'connections' => $found ? $found['connections'] : 0
            ];
        }

        // 3. TOP ACTIVE USERS - filtrés pour être ACTIFS (≤ 1 mois)
        // Inclure étudiants et formateurs, classés par nombre de sessions récentes puis dernière connexion
    $sessionsThreshold = now()->subDays($timeRange)->timestamp;
        $topActiveUsers = DB::table('users')
            ->select(
                'users.id',
                'users.nom',
                'users.email',
                // Compter uniquement les sessions récentes dans la fenêtre sélectionnée
                DB::raw("SUM(CASE WHEN sessions.last_activity >= {$sessionsThreshold} THEN 1 ELSE 0 END) as sessions_count"),
                DB::raw('MAX(COALESCE(
                    student_profiles.last_login_at,
                    teacher_profiles.last_login_at,
                    admin_profiles.last_login_at
                )) as last_seen')
            )
            ->leftJoin('sessions', 'sessions.user_id', '=', 'users.id')
            ->leftJoin('student_profiles', 'student_profiles.user_id', '=', 'users.id')
            ->leftJoin('teacher_profiles', 'teacher_profiles.user_id', '=', 'users.id')
            ->leftJoin('admin_profiles', 'admin_profiles.user_id', '=', 'users.id')
            // Ne pas filtrer sur sessions pour permettre aux users actifs sans sessions récentes d'apparaître avec 0
            // Limiter aux rôles visibles par admin: étudiants et formateurs
            ->whereIn('users.role', ['etudiant', 'formateur'])
                        // Filtrer les utilisateurs actifs (profil récent OU session récente)
                        ->where(function ($q) use ($activeThreshold, $sessionsThreshold) {
                                $q->where('student_profiles.last_login_at', '>=', $activeThreshold)
                                    ->orWhere('teacher_profiles.last_login_at', '>=', $activeThreshold)
                                    ->orWhere('admin_profiles.last_login_at', '>=', $activeThreshold)
                                    ->orWhereExists(function ($sub) use ($sessionsThreshold) {
                                            $sub->select(DB::raw(1))
                                                    ->from('sessions as s2')
                                                    ->whereColumn('s2.user_id', 'users.id')
                                                    ->where('s2.last_activity', '>=', $sessionsThreshold);
                                    });
            })
            ->groupBy('users.id', 'users.nom', 'users.email')
            ->orderBy('sessions_count', 'desc')
            ->orderBy('last_seen', 'desc')
            ->get()
            // Après agrégation, on prépare l'affichage et on garde seulement les top 5
            ->map(function($user) {
                // Correction : utiliser la date de la dernière session si plus récente que last_login_at
                $lastLogin = $user->last_seen ? \Carbon\Carbon::parse($user->last_seen) : null;
                $lastSessionTs = \DB::table('sessions')
                    ->where('user_id', $user->id)
                    ->orderByDesc('last_activity')
                    ->value('last_activity');
                $lastSession = $lastSessionTs ? \Carbon\Carbon::createFromTimestamp($lastSessionTs) : null;

                // Choisir la date la plus récente
                $effectiveLastSeen = null;
                if ($lastLogin && $lastSession) {
                    $effectiveLastSeen = $lastLogin->greaterThan($lastSession) ? $lastLogin : $lastSession;
                } elseif ($lastLogin) {
                    $effectiveLastSeen = $lastLogin;
                } elseif ($lastSession) {
                    $effectiveLastSeen = $lastSession;
                }

                $lastSeenText = 'Non disponible';
                if ($effectiveLastSeen) {
                    if ($effectiveLastSeen->isToday()) {
                        $diffMinutes = round($effectiveLastSeen->diffInMinutes(now()));
                        if ($diffMinutes < 5) {
                            $lastSeenText = 'En ligne';
                        } elseif ($diffMinutes < 60) {
                            $lastSeenText = "Il y a {$diffMinutes}min";
                        } else {
                            $lastSeenText = "Il y a " . (int) $effectiveLastSeen->diffInHours(now()) . "h";
                        }
                    } else {
                        $lastSeenText = "Il y a " . (int) $effectiveLastSeen->diffInDays(now()) . "j";
                    }
                }

                return [
                    'name' => $user->nom,
                    'email' => $user->email,
                    'sessionsCount' => $user->sessions_count,
                    'lastSeen' => $lastSeenText
                ];
            })
            ->take(5);

        // 4. RÉPONSE FINALE
        return response()->json([
            'overview' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'newUsers' => $newUsers,
                'dailyActiveUsers' => $dailyActiveUsers,
                'returningUsers' => $activeUsers - $newUsers, // Approximation
            ],
            'connections' => [
                'totalConnections' => $totalConnections,
                'uniqueConnections' => $uniqueConnections,
                'avgConnectionsPerUser' => $avgConnectionsPerUser,
                'avgSessionDuration' => $avgSessionDuration,
                'peakHour' => $peakHour,
                'connectionsByHour' => $allHours
            ],
            'topActiveUsers' => $topActiveUsers
        ], 200);
    }
    
}
