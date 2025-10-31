<?php

namespace App\Http\Controllers; 

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StudentProfileController extends Controller
{
    // GET /api/student-profiles
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 🔒 SÉCURITÉ : Seuls les admins, formateurs et super_admins peuvent voir tous les profils
        if (!in_array($user->role, ['admin', 'formateur', 'super_admin'])) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        // Récupérer tous les profils d'étudiants avec la relation 'user'
        $profiles = StudentProfile::with('user')->get();

        // Retourner les profils formatés
        return response()->json($profiles->map(function ($profile) {
            $coursesCount = method_exists($profile, 'courses') ? $profile->courses()->count() : 0;
            return [
                'last_login_at' => $profile->last_login_at,
                'created_at' => $profile->created_at,
                'updated_at' => $profile->updated_at,
                'coursesCount' => $coursesCount,
                'user' => [
                    'id' => $profile->user->id,
                    'name' => $profile->user->nom,
                    'email' => $profile->user->email,
                    'tel' => $profile->user->tel
                ]
            ];
        }), 200);
    }

    // POST /api/student-profiles (On a migrer vers la création de ce profile via AuthController - register)
    

    // GET /api/student-profiles/{user_id}
public function show(Request $request, $user_id)
{
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }
        // 🔒 SÉCURITÉ : Seuls les admins, formateurs et super_admins peuvent voir tous les profils
        if (!in_array($user->role, ['admin', 'formateur', 'super_admin'])) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }
    
    // Récupérer un profil étudiant par le user_id avec la relation 'user'
    $profile = StudentProfile::with('user')->where('user_id', $user_id)->first();

    if (!$profile) {
        return response()->json(['error' => 'Profil non trouvé'], 404);
    }

    // Retourner les informations du profil étudiant avec les données de l'utilisateur associé
    return response()->json([
        'id' => $profile->id,
        'user_id' => $profile->user_id,
        'specialite' => $profile->specialite,
        'photo' => $profile->photo,
        'last_login_at' => $profile->last_login_at,
        'user' => [
            'id' => $profile->user->id,
            'name' => $profile->user->nom,
            'email' => $profile->user->email
        ],
        'created_at' => $profile->created_at,
        'updated_at' => $profile->updated_at,
    ], 200);
}


    // PUT /api/student-profiles/{user_id}
public function update(Request $request, $user_id)
{
    $currentUser = $request->user();
    
    // 🔒 SÉCURITÉ : Un étudiant ne peut modifier que son propre profil
    if ($currentUser->role === 'etudiant' && $currentUser->id != $user_id) {
        return response()->json(['error' => 'Accès refusé.'], 403);
    }

    $request->validate([
        'nom' => 'nullable|string',
        'email' => 'nullable|email',
        'tel' => 'nullable|string',
        'ville' => 'nullable|string',
        'villeOrigine' => 'nullable|string|max:255',
        'naissance' => 'nullable|date',
        'specialite' => 'nullable|string',
        'photo' => 'nullable',
    ]);

    $user = User::findOrFail($user_id);
    $studentProfile = StudentProfile::where('user_id', $user_id)->firstOrFail();

    // Mise à jour du user
    $user->update([
        'nom' => $request->input('nom', $user->nom),
        'email' => $request->input('email', $user->email),
        'tel' => $request->input('tel', $user->tel),
        'ville' => $request->input('ville', $user->ville),
        'villeOrigine'=>$request->input('villeOrigine',$user->villeOrigine),
        'naissance' => $request->input('naissance', $user->naissance),
    ]);

   
    // Mise à jour de la photo (avatar ou image uploadée)
    if ($request->hasFile('photo')) {
        // Si l'utilisateur a uploadé une vraie image
        $path = $request->file('photo')->store('student_photos', 'public');
        $studentProfile->photo = $path;
    } elseif ($request->filled('photo')) {
        // Sinon, si c'est juste un nom de fichier SVG (par ex: "avatar3.svg")
        $studentProfile->photo = $request->input('photo');
    }


    if ($request->has('specialite')) {
        $studentProfile->specialite = $request->input('specialite');
    }

    $studentProfile->save();

    return response()->json([
        'message' => 'Profil mis à jour avec succès ✅',
        'user' => $user,
        'student_profile' => $studentProfile,
       
    ]);
}


    // DELETE /api/student-profiles/{user_id}
    public function destroy(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Seuls les admins peuvent supprimer des profils
        if ($currentUser->role !== 'admin') {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        // ✅ CORRECTION : Récupérer le profil par user_id, pas par ID de profil
        $profile = StudentProfile::where('user_id', $user_id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profil étudiant non trouvé'], 404);
        }

        // Récupérer l'utilisateur associé
        $user = User::find($user_id);
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Supprimer la photo de profil du disque si elle existe
        if ($profile->photo && !str_contains($profile->photo, 'avatar')) {
            Storage::disk('public')->delete($profile->photo);
        }

        // ⚠️ CHOIX CRITIQUE : Que supprimer ?
        // Option 1: Supprimer seulement le profil étudiant (garder l'utilisateur)
        $profile->delete();
        
        // Option 2: Supprimer complètement l'utilisateur (cascade les profils)
        // $user->delete(); // ⚠️ Décommentez si vous voulez supprimer l'utilisateur entièrement

        return response()->json([
            'message' => 'Profil étudiant supprimé avec succès.',
            'note' => 'L\'utilisateur existe toujours mais sans profil étudiant'
        ], 200);
    }

    // 🔒 GET /api/my-student-profile - Route sécurisée pour l'utilisateur connecté
    public function myProfile(Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un étudiant
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Cette route est réservée aux étudiants'], 403);
        }

        // Récupérer le profil étudiant de l'utilisateur connecté
        $profile = StudentProfile::with('user')->where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profil étudiant non trouvé'], 404);
        }

        return response()->json([
            'id' => $profile->id,
            'user_id' => $profile->user_id,
            'specialite' => $profile->specialite,
            'photo' => $profile->photo,
            'last_login_at' => $profile->last_login_at,
            'user' => [
                'id' => $profile->user->id,
                'name' => $profile->user->nom,
                'email' => $profile->user->email,
                'tel' => $profile->user->tel,
                'ville' => $profile->user->ville,
                'villeOrigine' => $profile->user->villeOrigine,
                'naissance' => $profile->user->naissance,
            ],
            'created_at' => $profile->created_at,
            'updated_at' => $profile->updated_at,
        ], 200);
    }

    // 🔒 PUT /api/my-student-profile - Mise à jour sécurisée pour l'utilisateur connecté
    public function updateMyProfile(Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un étudiant
        if ($user->role !== 'etudiant') {
            return response()->json(['error' => 'Cette route est réservée aux étudiants'], 403);
        }

        // Validation des données d'entrée
        $validator = Validator::make($request->all(), [
            // Données utilisateur
            'nom' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'tel' => 'sometimes|string|max:20',
            'ville' => 'sometimes|string|max:255',
            'villeOrigine' => 'sometimes|string|max:255',
            'naissance' => 'sometimes|date',
            // Données profil étudiant
            'specialite' => 'sometimes|string|max:255',
            'photo' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Mettre à jour les données utilisateur si fournies
            $userData = $request->only(['nom', 'email', 'tel', 'ville', 'villeOrigine', 'naissance']);
            if (!empty($userData)) {
                $user->update($userData);
                $user->refresh();
            }

            // Récupérer ou créer le profil étudiant
            $profile = StudentProfile::where('user_id', $user->id)->first();
            
            if (!$profile) {
                // Créer un nouveau profil si il n'existe pas
                $profile = StudentProfile::create([
                    'user_id' => $user->id,
                    'specialite' => $request->specialite,
                    'photo' => $request->photo ?? 'avatar1.svg',
                ]);
            } else {
                // Mettre à jour le profil existant
                $profileData = $request->only(['specialite', 'photo']);
                if (!empty($profileData)) {
                    $profile->update($profileData);
                    $profile->refresh();
                }
            }

            DB::commit();

            // Recharger les relations
            $profile->load('user');

            return response()->json([
                'message' => 'Profil étudiant mis à jour avec succès',
                'student_profile' => [
                    'id' => $profile->id,
                    'user_id' => $profile->user_id,
                    'specialite' => $profile->specialite,
                    'photo' => $profile->photo,
                    'last_login_at' => $profile->last_login_at,
                    'created_at' => $profile->created_at,
                    'updated_at' => $profile->updated_at,
                ],
                'user' => [
                    'id' => $user->id,
                    'nom' => $user->nom,
                    'email' => $user->email,
                    'tel' => $user->tel,
                    'ville' => $user->ville,
                    'villeOrigine' => $user->villeOrigine,
                    'naissance' => $user->naissance,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors de la mise à jour du profil étudiant: ' . $e->getMessage());
            return response()->json([
                'error' => 'Erreur lors de la mise à jour du profil',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}