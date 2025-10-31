<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOrSuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Récupération utilisateur via le guard API ou la requête
        $user = auth('api')->user() ?? $request->user();

        // Vérifier si l'utilisateur est connecté
        if (!$user) {
            return response()->json(['error' => 'Non authentifié.'], 401);
        }

        // Déterminer les rôles autorisés à partir du paramètre middleware
        // Exemple d'usage: role:admin_or_super_admin ou role:admin,super_admin
        $allowedRoles = ['admin', 'super_admin'];
        if (!empty($roles)) {
            // Laravel passe chaque paramètre séparé par virgule en items du tableau $roles
            // Si un seul paramètre 'admin_or_super_admin' est fourni, on l'élargit
            $flat = [];
            foreach ($roles as $r) {
                foreach (explode(',', $r) as $item) {
                    $flat[] = trim($item);
                }
            }
            if (in_array('admin_or_super_admin', $flat, true)) {
                $allowedRoles = ['admin', 'super_admin'];
            } else {
                $allowedRoles = $flat;
            }
        }

        // Vérifier si l'utilisateur a un des rôles autorisés
        if (!in_array($user->role, $allowedRoles, true)) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        return $next($request);
    }
}
