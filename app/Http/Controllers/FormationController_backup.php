<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class FormationController extends Controller
{
    /**
     * Helper pour générer l'URL de l'image
     */
    private function getImageUrl($imagePath)
    {
        if (!$imagePath || $imagePath === 'default_formation.jpg') {
            return url('storage/formations/default_formation.jpg');
        }
        return url('storage/' . $imagePath);
    }

    /**
     * GET /api/formations
     * Récupérer toutes les formations (pour admin et étudiants)
     */
    public function index(Request $request)
    {
        $formations = Formation::with(['teacher', 'category', 'courses'])
                              ->where('is_active', true)
                              ->orderBy('created_at', 'desc')
                              ->get();

        return response()->json($formations->map(function ($formation) {
            return [
                'id' => $formation->id,
                'title' => $formation->title,
                'description' => $formation->description,
                'image' => $formation->image,
                'teacher' => [
                    'id' => $formation->teacher->id,
                    'nom' => $formation->teacher->nom,
                ],
                'category' => [
                    'id' => $formation->category->id,
                    'name' => $formation->category->name,
                ],
                'price' => $formation->price,
                'duration_hours' => $formation->duration_hours,
                'difficulty_level' => $formation->difficulty_level,
                'total_enrolled' => $formation->total_enrolled,
                'average_rating' => $formation->average_rating,
                'courses_count' => $formation->courses->count(),
                'created_at' => $formation->created_at,
            ];
        }));
    }

    /**
     * GET /api/my-formations
     * Récupérer les formations du formateur connecté
     */
    public function myFormations(Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un formateur
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Cette route est réservée aux formateurs'], 403);
        }

        $formations = Formation::with(['category', 'courses'])
                              ->where('teacher_id', $user->id)
                              ->orderBy('created_at', 'desc')
                              ->get();

        return response()->json($formations->map(function ($formation) {
            return [
                'id' => $formation->id,
                'title' => $formation->title,
                'description' => $formation->description,
                'image' => $formation->image,
                'category' => [
                    'id' => $formation->category->id,
                    'name' => $formation->category->name,
                ],
                'price' => $formation->price,
                'duration_hours' => $formation->duration_hours,
                'difficulty_level' => $formation->difficulty_level,
                'is_active' => $formation->is_active,
                'total_enrolled' => $formation->total_enrolled,
                'average_rating' => $formation->average_rating,
                'courses' => $formation->courses->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'description' => $course->description,
                        'duration_minutes' => $course->duration_minutes,
                        'order_index' => $course->order_index,
                    ];
                }),
                'created_at' => $formation->created_at,
                'updated_at' => $formation->updated_at,
            ];
        }));
    }

    /**
     * GET /api/formations/{id}
     * Détails d'une formation
     */
    public function show($id)
    {
        $formation = Formation::with(['teacher', 'category', 'courses.chapters'])
                              ->findOrFail($id);

        return response()->json([
            'id' => $formation->id,
            'title' => $formation->title,
            'description' => $formation->description,
            'image' => $formation->image,
            'teacher' => [
                'id' => $formation->teacher->id,
                'nom' => $formation->teacher->nom,
            ],
            'category' => [
                'id' => $formation->category->id,
                'name' => $formation->category->name,
            ],
            'price' => $formation->price,
            'duration_hours' => $formation->duration_hours,
            'difficulty_level' => $formation->difficulty_level,
            'is_active' => $formation->is_active,
            'total_enrolled' => $formation->total_enrolled,
            'average_rating' => $formation->average_rating,
            'courses' => $formation->courses->map(function ($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'description' => $course->description,
                    'duration_minutes' => $course->duration_minutes,
                    'order_index' => $course->order_index,
                    'chapters_count' => $course->chapters->count(),
                ];
            }),
            'created_at' => $formation->created_at,
            'updated_at' => $formation->updated_at,
        ]);
    }

    /**
     * POST /api/formations
     * Créer une nouvelle formation (formateurs seulement)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un formateur
        if ($user->role !== 'formateur') {
            return response()->json(['error' => 'Seuls les formateurs peuvent créer des formations'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'category_id' => 'required|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'duration_hours' => 'nullable|integer|min:1',
            'difficulty_level' => 'required|in:debutant,intermediaire,avance',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Gérer l'upload d'image
        $imagePath = 'default_formation.jpg';
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('formations', 'public');
        }

        $formation = Formation::create([
            'title' => $request->title,
            'description' => $request->description,
            'image' => $imagePath,
            'teacher_id' => $user->id,
            'category_id' => $request->category_id,
            'price' => $request->price ?? 0,
            'duration_hours' => $request->duration_hours ?? 1,
            'difficulty_level' => $request->difficulty_level,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Formation créée avec succès',
            'formation' => $formation->load(['category']),
        ], 201);
    }

    /**
     * PUT /api/formations/{id}
     * Modifier une formation (formateur propriétaire seulement)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $formation = Formation::findOrFail($id);
        
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if ($user->role === 'formateur' && $formation->teacher_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez modifier que vos propres formations'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'nullable|numeric|min:0',
            'duration_hours' => 'nullable|integer|min:1',
            'difficulty_level' => 'nullable|in:debutant,intermediaire,avance',
            'image' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $formation->update($request->only([
            'title', 'description', 'category_id', 'price', 
            'duration_hours', 'difficulty_level', 'image', 'is_active'
        ]));

        return response()->json([
            'message' => 'Formation mise à jour avec succès',
            'formation' => $formation->load(['category']),
        ]);
    }

    /**
     * DELETE /api/formations/{id}
     * Supprimer une formation (formateur propriétaire seulement)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $formation = Formation::findOrFail($id);
        
        // Vérifier que l'utilisateur est le propriétaire ou un admin
        if ($user->role === 'formateur' && $formation->teacher_id !== $user->id) {
            return response()->json(['error' => 'Vous ne pouvez supprimer que vos propres formations'], 403);
        }

        $formation->delete();

        return response()->json(['message' => 'Formation supprimée avec succès']);
    }

    /**
     * GET /api/formations/{id}/stats
     * Statistiques d'une formation
     */
    public function stats($id)
    {
        $formation = Formation::with(['enrollments', 'courses'])->findOrFail($id);

        return response()->json([
            'formation_id' => $formation->id,
            'title' => $formation->title,
            'total_enrolled' => $formation->total_enrolled,
            'total_courses' => $formation->courses->count(),
            'average_rating' => $formation->average_rating,
            'total_revenue' => $formation->enrollments->where('payment_status', 'paid')->sum('amount_paid'),
        ]);
    }
}
