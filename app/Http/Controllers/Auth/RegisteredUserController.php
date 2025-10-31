<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
{
    // Validation backend
    $request->validate([
        'nom' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'string', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        'tel' => ['required', 'string', 'max:20'],
        'indicatif' => ['required', 'string', 'max:10'],
        'ville' => ['required', 'string', 'max:100'],
        'villeOrigine' => ['nullable', 'boolean'],
        'naissance' => ['nullable', 'date'],
        'role' => ['required', 'in:etudiant,formateur,admin,super_admin'],
        'is_super_admin' => ['nullable', 'boolean'],
    ]);

    try {
        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tel' => $request->tel,
            'indicatif' => $request->indicatif,
            'ville' => $request->ville,
            'villeOrigine' => $request->villeOrigine ?? false,
            'naissance' => $request->naissance,
            'role' => $request->role,
            'is_super_admin' => $request->role === 'super_admin' ? 1 : 0,
        ]);

        // Si le rôle est formateur, créer un profil formateur vide
        if ($user->role === 'formateur') {
            \App\Models\TeacherProfile::create([
                'user_id' => $user->id,
                // Les autres champs restent vides/nulls
            ]);
        }

        event(new Registered($user));
        Auth::login($user);

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Erreur inscription: ' . $e->getMessage()); // Pour débugger
        return response()->json([
            'error' => 'Une erreur est survenue lors de l\'inscription.',
            'message' => $e->getMessage()
        ], 500);
    }
}
}
