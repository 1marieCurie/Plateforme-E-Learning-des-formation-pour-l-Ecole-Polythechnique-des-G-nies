<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class TeacherProfileController extends Controller
{
    /**
     * GET /api/teacher-profiles
     * Récupérer tous les profils de formateurs
     */
    public function index(Request $request)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Seuls les admins et super_admins peuvent voir tous les profils formateurs
        if (!in_array($currentUser->role, ['admin', 'super_admin'])) {
            return response()->json(['error' => 'Accès refusé. Seuls les administrateurs peuvent consulter tous les profils formateurs.'], 403);
        }

        // Récupérer TOUS les profils (pas seulement les vérifiés) pour l'admin
        $profiles = TeacherProfile::with('user')
                                  ->orderBy('created_at', 'desc')
                                  ->get();

        return response()->json($profiles->map(function ($profile) {
            // Calcul du nombre total d'étudiants inscrits dans les formations du formateur
            $studentsCount = 0;
            if (method_exists($profile->user, 'createdFormations')) {
                $formations = $profile->user->createdFormations;
                foreach ($formations as $formation) {
                    if (method_exists($formation, 'students')) {
                        $studentsCount += $formation->students()->count();
                    }
                }
            }
            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'specialite' => $profile->specialite,
                'bio' => $profile->bio,
                'experience_years' => $profile->experience_years,
                'photo' => $profile->photo_url ?? null,
                'average_rating' => $profile->average_rating,
                'total_students' => $profile->total_students,
                'studentsCount' => $studentsCount,
                'total_formations' => $profile->total_formations,
                'is_verified' => $profile->is_verified,
                'created_at' => $profile->created_at,
                'last_login_at' => $profile->last_login_at,
                'user' => [
                    'id' => $profile->user->id,
                    'nom' => $profile->user->nom,
                    'email' => $profile->user->email,
                    'tel' => $profile->user->tel,
                    'ville' => $profile->user->ville
                ]
            ];
        }), 200);
    }

    /**
     * GET /api/teacher-profiles/{user_id}
     * Récupérer un profil de formateur spécifique
     */
    public function show(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Un formateur ne peut voir que son propre profil (sauf admin)
        if ($currentUser->role === 'formateur' && $currentUser->id != $user_id) {
            return response()->json([
                'error' => 'Accès refusé. Vous ne pouvez consulter que votre propre profil.'
            ], 403);
        }
        
        $user = User::where('role', 'formateur')->findOrFail($user_id);
        
        // Créer automatiquement le profil s'il n'existe pas
        $teacherProfile = $user->teacherProfile ?? TeacherProfile::create([
            'user_id' => $user->id,
            'specialite' => 'Formateur',
            'bio' => null,
            'experience_years' => 0
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'email' => $user->email,
                'ville' => $user->ville,
                'tel' => $user->tel
            ],
            'profile' => [
                'specialite' => $teacherProfile->specialite,
                'bio' => $teacherProfile->bio,
                'experience_years' => $teacherProfile->experience_years,
                'photo' => $teacherProfile->photo_url,
                'linkedin_url' => $teacherProfile->linkedin_url,
                'website_url' => $teacherProfile->website_url,
                'certifications' => $teacherProfile->certifications,
                'skills' => $teacherProfile->skills,
                'is_verified' => $teacherProfile->is_verified,
                'average_rating' => $teacherProfile->average_rating,
                'total_students' => $teacherProfile->total_students,
                'total_formations' => $teacherProfile->total_formations,
                'success_rate' => $teacherProfile->success_rate
            ]
        ]);
    }

    /**
     * PUT /api/teacher-profiles/{user_id}
     * Mettre à jour un profil de formateur
     */
    public function update(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ CRITIQUE : Un formateur ne peut modifier que son propre profil
        if ($currentUser->role === 'formateur' && $currentUser->id != $user_id) {
            return response()->json([
                'error' => 'Accès refusé. Vous ne pouvez modifier que votre propre profil.'
            ], 403);
        }
        
        // 🔒 Seuls les formateurs et admins peuvent modifier des profils formateurs
        if (!in_array($currentUser->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'nom' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'tel' => 'nullable|string|max:20',
            'ville' => 'nullable|string|max:255',
            'specialite' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'experience_years' => 'nullable|integer|min:0|max:50',
            'linkedin_url' => 'nullable|url|max:500',
            'website_url' => 'nullable|url|max:500',
            'certifications' => 'nullable|array',
            'skills' => 'nullable|array',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $user = User::where('role', 'formateur')->findOrFail($user_id);
        $teacherProfile = $user->teacherProfile ?? TeacherProfile::create(['user_id' => $user->id]);

        // Mise à jour des données utilisateur
        if ($request->has('nom')) {
            $user->nom = $request->input('nom');
        }
        if ($request->has('email')) {
            $user->email = $request->input('email');
        }
        if ($request->has('tel')) {
            $user->tel = $request->input('tel');
        }
        if ($request->has('ville')) {
            $user->ville = $request->input('ville');
        }
        $user->save();

        // Mise à jour de la photo
        if ($request->hasFile('photo')) {
            if ($teacherProfile->photo && Storage::disk('public')->exists($teacherProfile->photo)) {
                Storage::disk('public')->delete($teacherProfile->photo);
            }
            $path = $request->file('photo')->store('teacher_photos', 'public');
            $teacherProfile->photo = $path;
        }

        // Mise à jour des autres champs du profil
        $profileFields = ['specialite', 'bio', 'experience_years', 'linkedin_url', 'website_url', 'certifications', 'skills'];
        foreach ($profileFields as $field) {
            if ($request->has($field)) {
                $teacherProfile->$field = $request->input($field);
            }
        }

        $teacherProfile->save();

        // Mettre à jour les statistiques
        $teacherProfile->updateStats();

        return response()->json([
            'message' => 'Profil mis à jour avec succès ✅',
            'user' => $user,
            'teacher_profile' => $teacherProfile,
        ]);
    }

    /**
     * DELETE /api/teacher-profiles/{user_id}
     * Supprimer un profil de formateur
     */
    public function destroy(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ CRITIQUE : Seuls les admins peuvent supprimer des profils
        if ($currentUser->role !== 'admin') {
            return response()->json([
                'error' => 'Accès refusé.'
            ], 403);
        }
        
        $profile = TeacherProfile::where('user_id', $user_id)->first();
        
        if (!$profile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        // Supprimer la photo de profil du disque si elle existe
        if ($profile->photo && Storage::disk('public')->exists($profile->photo)) {
            Storage::disk('public')->delete($profile->photo);
        }

        $profile->delete();

        return response()->json(['message' => 'Profil supprimé avec succès']);
    }

    /**
     * POST /api/teacher-profiles/{user_id}/verify
     * Vérifier un formateur (admin seulement)
     */
    public function verify(Request $request, $user_id)
    {
        $currentUser = $request->user();
        
        // 🔒 SÉCURITÉ : Seuls les admins peuvent vérifier des formateurs
        if ($currentUser->role !== 'admin') {
            return response()->json([
                'error' => 'Accès refusé.'
            ], 403);
        }
        
        $profile = TeacherProfile::where('user_id', $user_id)->firstOrFail();
        
        $profile->update(['is_verified' => true]);
        
        return response()->json([
            'message' => 'Formateur vérifié avec succès ✅',
            'profile' => $profile,
            'verified_by' => $currentUser->nom
        ]);
    }

    /**
     * GET /api/teacher-profiles/stats/{user_id}
     * Statistiques détaillées d'un formateur
     */
    public function stats($user_id)
    {
        $profile = TeacherProfile::where('user_id', $user_id)->firstOrFail();
        
        return response()->json([
            'total_formations' => $profile->total_formations,
            'total_students' => $profile->total_students,
            'active_students' => $profile->active_students_count,
            'success_rate' => $profile->success_rate,
            'average_rating' => $profile->average_rating,
            'experience_years' => $profile->experience_years,
            'is_verified' => $profile->is_verified
        ]);
    }

    /**
     * 🔒 GET /api/my-teacher-profile
     * Route sécurisée pour que le formateur consulte son propre profil
     */
    public function myProfile(Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un formateur
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Cette route est réservée aux formateurs'], 403);
        }

        // Récupérer le profil formateur de l'utilisateur connecté
        $profile = TeacherProfile::with('user')->where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profil formateur non trouvé. Contactez l\'administrateur.'], 404);
        }

        return response()->json([
            'id' => $profile->id,
            'user_id' => $profile->user_id,
            'specialite' => $profile->specialite,
            'bio' => $profile->bio,
            'experience_years' => $profile->experience_years,
            'photo' => $profile->photo_url ?? null,
            'linkedin_url' => $profile->linkedin_url,
            'website_url' => $profile->website_url,
            'certifications' => $profile->certifications,
            'skills' => $profile->skills,
            'average_rating' => $profile->average_rating,
            'total_students' => $profile->total_students,
            'total_formations' => $profile->total_formations,
            'total_courses' => $profile->total_courses,
            'is_verified' => $profile->is_verified,
            'last_login_at' => $profile->last_login_at,
            'user' => [
                'id' => $profile->user->id,
                'nom' => $profile->user->nom,
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

    /**
     * 🔒 PUT /api/my-teacher-profile
     * Route sécurisée pour que le formateur mette à jour son propre profil
     */
    public function updateMyProfile(Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un formateur
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Cette route est réservée aux formateurs'], 403);
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
            'bio' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0|max:50',
            'linkedin_url' => 'nullable|url',
            'website_url' => 'nullable|url',
            'certifications' => 'nullable|array',
            'skills' => 'nullable|array',
            'photo' => $photoValidation,
        ]);

        $teacherProfile = TeacherProfile::where('user_id', $user->id)->first();
        
        // Créer le profil s'il n'existe pas
        if (!$teacherProfile) {
            $teacherProfile = TeacherProfile::create([
                'user_id' => $user->id,
                'specialite' => 'Enseignement',
                'bio' => null,
                'experience_years' => 0
            ]);
        }

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
            if ($teacherProfile->photo && Storage::disk('public')->exists($teacherProfile->photo)) {
                Storage::disk('public')->delete($teacherProfile->photo);
            }
            $path = $request->file('photo')->store('teacher_photos', 'public');
            $teacherProfile->photo = $path;
        } elseif ($request->has('photo') && in_array($request->input('photo'), $allowedAvatars)) {
            // Avatar prédéfini
            $teacherProfile->photo = $request->input('photo');
        }

        // Mise à jour des champs du profil formateur
        if ($request->has('specialite')) {
            $teacherProfile->specialite = $request->input('specialite');
        }
        if ($request->has('bio')) {
            $teacherProfile->bio = $request->input('bio');
        }
        if ($request->has('experience_years')) {
            $teacherProfile->experience_years = $request->input('experience_years');
        }
        if ($request->has('linkedin_url')) {
            $teacherProfile->linkedin_url = $request->input('linkedin_url');
        }
        if ($request->has('website_url')) {
            $teacherProfile->website_url = $request->input('website_url');
        }
        if ($request->has('certifications')) {
            $teacherProfile->certifications = $request->input('certifications');
        }
        if ($request->has('skills')) {
            $teacherProfile->skills = $request->input('skills');
        }

        $teacherProfile->save();

        return response()->json([
            'message' => 'Profil formateur mis à jour avec succès ✅',
            'user' => $user,
            'teacher_profile' => $teacherProfile,
        ]);
    }
}
