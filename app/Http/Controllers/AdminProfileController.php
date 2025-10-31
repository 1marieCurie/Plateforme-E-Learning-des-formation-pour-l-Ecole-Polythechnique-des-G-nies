<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminProfileController extends Controller
{
    // GET /api/admin-profiles
    public function index(Request $request)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Seuls les Super Admins peuvent voir tous les profils admin
        if (!$currentUser->is_super_admin) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        // Récupérer tous les profils d'admins avec la relation 'user'
        $profiles = AdminProfile::with('user')->get();

        // Retourner les profils formatés
        return response()->json($profiles->map(function ($profile) {
            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'specialite' => $profile->specialite,
                'photo' => $profile->photo,
                'last_login_at' => $profile->last_login_at,
                'created_at' => $profile->created_at,
                'updated_at' => $profile->updated_at,
                'user' => [
                    'id' => $profile->user->id,
                    'name' => $profile->user->nom,
                    'email' => $profile->user->email,
                    'is_super_admin' => $profile->user->is_super_admin
                ]
            ];
        }), 200);
    }



    // GET /api/admin-profiles/{user_id}
    public function show(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Un admin ne peut voir que son propre profil (sauf Super Admin)
        if (!$currentUser->is_super_admin && $currentUser->id != $user_id) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        $user = User::findOrFail($user_id);
        
        // Crée automatiquement le profil s'il n'existe pas
        $adminProfile = $user->adminProfile ?? AdminProfile::create([
            'user_id' => $user->id,
            'specialite' => 'Administration',
            'photo' => null
        ]);

    return response()->json([
        'user' => [
            'id' => $user->id,
            'name' => $user->nom,
            'email' => $user->email
        ],
        'profile' => [
            'specialite' => $adminProfile->specialite,
            'photo' => $adminProfile->photo
        ]
    ]);
}

    // PUT /api/admin-profiles/{user_id}
    public function update(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Un admin ne peut modifier que son propre profil (sauf Super Admin)
        if (!$currentUser->is_super_admin && $currentUser->id != $user_id) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        // Liste des avatars prédéfinis autorisés
        $allowedAvatars = [
            'avatar1.svg', 'avatar2.svg', 'avatar3.svg', 'avatar4.svg', 'avatar5.svg', 'avatar6.svg',
            'avatar7.svg', 'avatar8.svg', 'avatar9.svg', 'avatar10.svg', 'avatar11.svg', 'avatar12.svg',
            'avatar13.svg', 'avatar14.svg', 'avatar15.svg', 'avatar16.svg', 'avatar17.svg', 'avatar18.svg',
            'avatar19.svg', 'avatar20.svg', 'avatar21.svg', 'avatar22.svg', 'avatar23.svg', 'avatar24.svg',
            'avatar25.svg'
        ];

        // Validation dynamique selon le type de photo
        $photoValidation = $request->hasFile('photo') 
            ? 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
            : 'nullable|string|in:' . implode(',', $allowedAvatars);

        $request->validate([
            'nom' => 'nullable|string',
            'email' => 'nullable|email',
            'tel' => 'nullable|string',
            'ville' => 'nullable|string',
            'villeOrigine' => 'nullable|string|max:255',
            'naissance' => 'nullable|date',
            'specialite' => 'nullable|string',
            'photo' => $photoValidation,
        ]);

        $user = User::findOrFail($user_id);
        $adminProfile = AdminProfile::where('user_id', $user_id)->firstOrFail();

        // Mise à jour du user
        $user->update([
            'nom' => $request->input('nom', $user->nom),
            'email' => $request->input('email', $user->email),
            'tel' => $request->input('tel', $user->tel),
            'ville' => $request->input('ville', $user->ville),
            'villeOrigine' => $request->input('villeOrigine', $user->villeOrigine),
            'naissance' => $request->input('naissance', $user->naissance),
        ]);

        // Mise à jour de la photo (avatar prédéfini ou image uploadée)
        if ($request->hasFile('photo')) {
            // Photo uploadée
            if ($adminProfile->photo && Storage::disk('public')->exists($adminProfile->photo)) {
                Storage::disk('public')->delete($adminProfile->photo);
            }
            $path = $request->file('photo')->store('admin_photos', 'public');
            $adminProfile->photo = $path;
        } elseif ($request->has('photo') && in_array($request->input('photo'), $allowedAvatars)) {
            // Avatar prédéfini
            $adminProfile->photo = $request->input('photo');
        }

        if ($request->has('specialite')) {
            $adminProfile->specialite = $request->input('specialite');
        }

        $adminProfile->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès ✅',
            'user' => $user,
            'admin_profile' => $adminProfile,
        ]);
    }

    // DELETE /api/admin-profiles/{user_id}
    public function destroy(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ CRITIQUE : Seuls les Super Admins peuvent supprimer des admins
        if (!$currentUser->is_super_admin) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }
        
        $targetUser = User::find($user_id);
        
        // 🛡️ Protection : Empêcher l'auto-suppression du Super Admin
        if ($targetUser && $targetUser->is_super_admin && $targetUser->id === $currentUser->id) {
            return response()->json(['error' => 'Impossible de supprimer votre propre compte Super Admin.'], 403);
        }
        
        // ⚠️ Avertissement si tentative de suppression d'un autre Super Admin
        if ($targetUser && $targetUser->is_super_admin) {
            return response()->json(['error' => 'Impossible de supprimer un autre Super Admin.'], 403);
        }

        // Récupérer le profil admin
        $profile = AdminProfile::where('user_id', $user_id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        // Supprimer la photo de profil du disque si elle existe
        if ($profile->photo) {
            Storage::disk('public')->delete($profile->photo);
        }

        // ✅ CORRECTION : Supprimer COMPLÈTEMENT l'utilisateur (cascade le profil)
        if ($targetUser) {
            $targetUser->delete(); // Ceci supprimera aussi le profil via les contraintes FK
        } else {
            $profile->delete(); // Fallback si l'utilisateur n'existe plus
        }

        return response()->json(['message' => 'Admin supprimé avec succès (utilisateur et profil).'], 200);
    }

    // GET /api/my-admin-profile - Pour l'admin connecté (pas besoin d'être super admin)
    public function myProfile(Request $request)
    {
        $currentUser = $request->user();
        try {
            // 🔒 SÉCURITÉ : Seuls les admins ou super_admins peuvent accéder à cette route
            if (!in_array($currentUser->role, ['admin', 'super_admin'])) {
                return response()->json(['error' => 'Accès refusé. Vous devez être admin ou super_admin.'], 403);
            }

            // Crée automatiquement le profil s'il n'existe pas
            $adminProfile = $currentUser->adminProfile ?? AdminProfile::create([
                'user_id' => $currentUser->id,
                'specialite' => 'Administration',
                'photo' => null
            ]);

            return response()->json([
                'user' => [
                    'id' => $currentUser->id,
                    'name' => $currentUser->nom,
                    'email' => $currentUser->email,
                    'tel' => $currentUser->tel,
                    'ville' => $currentUser->ville,
                    'villeOrigine' => $currentUser->villeOrigine,
                    'naissance' => $currentUser->naissance,
                    'created_at' => $currentUser->created_at
                ],
                'profile' => [
                    'specialite' => $adminProfile->specialite,
                    'photo' => $adminProfile->photo,
                    'last_login_at' => $adminProfile->last_login_at
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur myProfile super_admin: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur interne: ' . $e->getMessage()], 500);
        }
    }

    // PUT /api/my-admin-profile - Pour l'admin connecté (pas besoin d'être super admin)
    public function updateMyProfile(Request $request)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Seuls les admins ou super_admins peuvent accéder à cette route
        if (!in_array($currentUser->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Accès refusé. Vous devez être admin ou super_admin.'], 403);
        }

        // Liste des avatars prédéfinis autorisés
        $allowedAvatars = [
            'avatar1.svg', 'avatar2.svg', 'avatar3.svg', 'avatar4.svg', 'avatar5.svg', 'avatar6.svg',
            'avatar7.svg', 'avatar8.svg', 'avatar9.svg', 'avatar10.svg', 'avatar11.svg', 'avatar12.svg',
            'avatar13.svg', 'avatar14.svg', 'avatar15.svg', 'avatar16.svg', 'avatar17.svg', 'avatar18.svg',
            'avatar19.svg', 'avatar20.svg', 'avatar21.svg', 'avatar22.svg', 'avatar23.svg', 'avatar24.svg',
            'avatar25.svg'
        ];

        // Validation dynamique selon le type de photo
        $photoValidation = $request->hasFile('photo') 
            ? 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
            : 'nullable|string|in:' . implode(',', $allowedAvatars);

        $request->validate([
            'nom' => 'nullable|string',
            'email' => 'nullable|email',
            'tel' => 'nullable|string',
            'ville' => 'nullable|string',
            'villeOrigine' => 'nullable|string|max:255',
            'naissance' => 'nullable|date',
            'specialite' => 'nullable|string',
            'photo' => $photoValidation,
        ]);

        $adminProfile = AdminProfile::where('user_id', $currentUser->id)->first();
        
        // Créer le profil s'il n'existe pas
        if (!$adminProfile) {
            $adminProfile = AdminProfile::create([
                'user_id' => $currentUser->id,
                'specialite' => 'Administration',
                'photo' => null
            ]);
        }

        // Mise à jour du user
        $currentUser->update([
            'nom' => $request->input('nom', $currentUser->nom),
            'email' => $request->input('email', $currentUser->email),
            'tel' => $request->input('tel', $currentUser->tel),
            'ville' => $request->input('ville', $currentUser->ville),
            'villeOrigine' => $request->input('villeOrigine', $currentUser->villeOrigine),
            'naissance' => $request->input('naissance', $currentUser->naissance),
        ]);

        // Mise à jour de la photo (avatar prédéfini ou image uploadée)
        if ($request->hasFile('photo')) {
            // Photo uploadée
            if ($adminProfile->photo && Storage::disk('public')->exists($adminProfile->photo)) {
                Storage::disk('public')->delete($adminProfile->photo);
            }
            $path = $request->file('photo')->store('admin_photos', 'public');
            $adminProfile->photo = $path;
        } elseif ($request->has('photo') && in_array($request->input('photo'), $allowedAvatars)) {
            // Avatar prédéfini
            $adminProfile->photo = $request->input('photo');
        }

        if ($request->has('specialite')) {
            $adminProfile->specialite = $request->input('specialite');
        }

        $adminProfile->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès ✅',
            'user' => $currentUser,
            'admin_profile' => $adminProfile,
        ]);
    }

    /**
     * POST /api/admin/promote
     * Promouvoir un utilisateur en admin (action simple)
     * Corps attendu: { user_id: int }
     */
    public function promoteToAdmin(Request $request)
    {
        $actor = $request->user();

        // Seul un super_admin peut promouvoir
        if ($actor->role !== 'super_admin') {
            return response()->json(['error' => 'Accès refusé. Super Admin requis.'], 403);
        }

        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $target = User::findOrFail($data['user_id']);

        if ($target->role === 'admin') {
            return response()->json(['message' => 'Cet utilisateur est déjà admin.'], 200);
        }

        if ($target->role === 'super_admin') {
            return response()->json(['error' => 'Impossible de modifier le rôle d’un super_admin via cette route.'], 400);
        }

        // Promouvoir
        $target->update([
            'role' => 'admin',
            'is_super_admin' => false,
        ]);

        // Créer le profil admin s’il n’existe pas
        AdminProfile::firstOrCreate([
            'user_id' => $target->id,
        ], [
            'specialite' => 'Administration',
            'photo' => null,
        ]);

        return response()->json([
            'message' => 'Utilisateur promu en administrateur avec succès ✅',
            'user' => [
                'id' => $target->id,
                'nom' => $target->nom,
                'email' => $target->email,
                'role' => $target->role,
            ],
        ], 200);
    }

    /**
     * POST /api/admin/promote-superadmin
     * Promouvoir un utilisateur en super_admin
     */
    public function promoteToSuperAdmin(Request $request)
    {
        $actor = $request->user();
        if ($actor->role !== 'super_admin') {
            return response()->json(['error' => 'Accès refusé. Super Admin requis.'], 403);
        }

        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $target = User::findOrFail($data['user_id']);
        if ($target->role === 'super_admin') {
            return response()->json(['message' => 'Cet utilisateur est déjà super_admin.'], 200);
        }

        $target->update([
            'role' => 'super_admin',
            'is_super_admin' => true,
        ]);

        // Optionnel: créer profil admin si utile
        AdminProfile::firstOrCreate([
            'user_id' => $target->id,
        ], [
            'specialite' => 'Administration',
            'photo' => null,
        ]);

        return response()->json([
            'message' => 'Utilisateur promu en super_admin avec succès ✅',
            'user' => [
                'id' => $target->id,
                'nom' => $target->nom,
                'email' => $target->email,
                'role' => $target->role,
            ],
        ], 200);
    }

    /**
     * POST /api/admin/revoke
     * Révoquer le rôle admin (redevient formateur)
     */
    public function revokeAdmin(Request $request)
    {
        $actor = $request->user();
        if ($actor->role !== 'super_admin') {
            return response()->json(['error' => 'Accès refusé. Super Admin requis.'], 403);
        }

        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $target = User::findOrFail($data['user_id']);

        if ($target->role === 'super_admin') {
            return response()->json(['error' => 'Impossible de révoquer un super_admin via cette route.'], 400);
        }

        $target->update([
            'role' => 'formateur',
            'is_super_admin' => false,
        ]);

        return response()->json([
            'message' => 'Rôle administrateur révoqué avec succès ✅',
            'user' => [
                'id' => $target->id,
                'nom' => $target->nom,
                'email' => $target->email,
                'role' => $target->role,
            ],
        ], 200);
    }
}