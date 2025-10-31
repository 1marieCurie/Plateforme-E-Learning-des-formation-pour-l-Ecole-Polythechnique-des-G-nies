<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\AdminProfile;
use App\Models\TeacherProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    // 📝 Registration publique (limitée aux étudiants)
    public function register(Request $request) {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string|min:6',
            'indicatif' => 'required|string|max:5',
            'tel' => 'required|string|min:8|max:20|unique:users,tel',
            'ville' => 'required|string|max:100',
            'villeOrigine' => 'required|boolean',
             'naissance' => ['nullable', 'date'],
            // 🔒 SÉCURITÉ : Registration publique limitée aux étudiants seulement
            'role' => 'required|string|in:etudiant',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
        \DB::beginTransaction();

        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'indicatif' => $request->indicatif,
            'tel' => $request->tel,
            'ville' => $request->ville,
            'villeOrigine' => $request->villeOrigine ?? false,
            'naissance' => $request->naissance,
            'role' => $request->role
        ]);

        if ($request->role == 'etudiant') {
            StudentProfile::create([
                'user_id' => $user->id,
                'specialite' => $request->specialite ?? 'Informatique',
                'photo' => null,
                'last_login_at' => now(),
            ]);
        } 
        elseif ($request->role == 'formateur') {
            $teacherProfile = TeacherProfile::create([
                'user_id' => $user->id,
                'specialite' => $request->specialite ?? 'Développement Web',
                'bio' => $request->bio ?? 'Nouveau formateur',
                'experience_years' => $request->experience_years ?? 0,
                'is_verified' => false,
                'last_login_at' => now(),
            ]);
            
            \Log::info("TeacherProfile créé avec succès pour user_id: " . $user->id . ", profile_id: " . $teacherProfile->id);
        }
        elseif ($request->role == 'admin') {
            AdminProfile::create([
                'user_id' => $user->id,
                'specialite' => $request->specialite ?? 'Administration',
                'photo' => null,
                'last_login_at' => now(),
            ]);
        }

        $token = JWTAuth::fromUser($user);
        
        \DB::commit();

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $token
        ], 201);

    } catch (\Exception $e) {
        \DB::rollBack();
        \Log::error("Erreur d'inscription: ".$e->getMessage());
        return response()->json([
            'error' => 'Erreur lors de l\'inscription',
            'message' => $e->getMessage()
        ], 500);
    }
        
    }

    public function login(Request $request) {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'details' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Email ou mot de passe incorrect'], 401);
        }

        $user = auth()->user();
        // S'assurer que l'utilisateur a bien un rôle
        if (!$user->role) {
            return response()->json(['error' => 'Utilisateur sans rôle défini'], 500);
        }

        // Enregistrement manuel de la session pour les connexions API
        // (utile pour le suivi statistique des étudiants)
        try {
            $sessionId = bin2hex(random_bytes(16));
            \DB::table('sessions')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'id' => $sessionId
                ],
                [
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'payload' => '',
                    'last_activity' => time()
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'enregistrement de la session API: ' . $e->getMessage());
        }

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function me() {
        return response()->json(auth()->user());
    }

    public function logout() {
       try {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Déconnexion réussie']);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Impossible de se déconnecter'], 500);
    }
    }
}
