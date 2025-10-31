<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Route temporaire pour éviter l'erreur 500 - retourne toujours 401 pour les API
Route::get('/login', function () {
    // Si c'est une requête AJAX/API, retourner JSON
    if (request()->expectsJson() || request()->is('api/*')) {
        return response()->json(['message' => 'Non authentifié'], 401);
    }
    // Sinon, rediriger vers une page par défaut
    return redirect('/');
})->name('login');

require __DIR__.'/auth.php';
