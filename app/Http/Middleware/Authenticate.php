<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        // Pour une API, on ne redirige jamais vers login
        // On laisse Laravel retourner une erreur 401
        return null;
    }
}
