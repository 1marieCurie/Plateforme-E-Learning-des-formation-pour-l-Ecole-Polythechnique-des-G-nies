<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Vérifier si l'utilisateur est connecté
        if (!$user) {
            return response()->json(['error' => 'Non authentifié.'], 401);
        }

        // Vérifier si l'utilisateur est un Super Admin
        if (!$user->is_super_admin) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        return $next($request);
    }
}
