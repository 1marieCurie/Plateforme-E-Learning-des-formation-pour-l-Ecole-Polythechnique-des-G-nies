<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Afficher toutes les catégories
     */
    public function index(): JsonResponse
    {
        try {
            $categories = Category::select('id', 'nom', 'description')
                ->orderBy('nom')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des catégories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher une catégorie spécifique
     */
    public function show($id): JsonResponse
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catégorie non trouvée'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer une nouvelle catégorie (pour admin seulement)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255|unique:categories,nom',
                'description' => 'nullable|string'
            ]);

            $category = Category::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Catégorie créée avec succès',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour une catégorie (pour admin seulement)
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catégorie non trouvée'
                ], 404);
            }

            $validated = $request->validate([
                'nom' => 'required|string|max:255|unique:categories,nom,' . $id,
                'description' => 'nullable|string'
            ]);

            $category->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Catégorie mise à jour avec succès',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une catégorie (pour admin seulement)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $category = Category::find($id);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catégorie non trouvée'
                ], 404);
            }

            // Vérifier si la catégorie est utilisée
            if ($category->courses()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer cette catégorie car elle est utilisée par des cours'
                ], 400);
            }

            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Catégorie supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la catégorie',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}