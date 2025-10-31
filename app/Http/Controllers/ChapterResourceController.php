<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\ChapterResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChapterResourceController extends Controller
{
    /**
     * Afficher toutes les ressources d'un chapitre
     */
    public function index(Request $request, $chapterId)
    {
        $chapter = Chapter::findOrFail($chapterId);
        
        // Vérifier si l'utilisateur a accès au cours
        if (!$chapter->course->isAccessibleBy(auth()->user())) {
            return response()->json(['error' => 'Accès non autorisé à ce chapitre'], 403);
        }

        $query = $chapter->resources();
        
        // Filtres
        if ($request->has('type')) {
            $query->byType($request->type);
        }
        
        if ($request->has('access_level')) {
            $query->byAccessLevel($request->access_level);
        }
        
        if ($request->boolean('downloadable_only')) {
            $query->downloadable();
        }
        
        if ($request->boolean('required_only')) {
            $query->required();
        }
        
        // Pour les étudiants, ne montrer que les ressources disponibles et accessibles
        if (auth()->user()->role === 'étudiant') {
            $query->available();
            $resources = $query->get()->filter(function ($resource) {
                return $resource->isAccessibleBy(auth()->user());
            })->values();
        } else {
            $resources = $query->get();
        }

        return response()->json([
            'chapter' => [
                'id' => $chapter->id,
                'titre' => $chapter->titre,
                'description' => $chapter->description
            ],
            'resources' => $resources->map(function ($resource) {
                return [
                    'id' => $resource->id,
                    'title' => $resource->title,
                    'description' => $resource->description,
                    'file_type' => $resource->file_type,
                    'file_icon' => $resource->file_icon,
                    'formatted_file_size' => $resource->formatted_file_size,
                    'formatted_duration' => $resource->formatted_duration,
                    'is_downloadable' => $resource->is_downloadable,
                    'is_required' => $resource->is_required,
                    'is_active' => $resource->is_active,
                    'access_level' => $resource->access_level,
                    'download_count' => $resource->download_count,
                    'view_count' => $resource->view_count,
                    'available_from' => $resource->available_from,
                    'available_until' => $resource->available_until,
                    'file_url' => auth()->user()->role !== 'étudiant' || $resource->isAccessibleBy(auth()->user()) 
                                  ? $resource->file_url : null,
                    'created_at' => $resource->created_at,
                ];
            })
        ]);
    }

    /**
     * Créer une nouvelle ressource pour un chapitre
     */
    public function store(Request $request, $chapterId)
    {
        // Seuls les formateurs et admins peuvent créer des ressources
        if (!in_array(auth()->user()->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $chapter = Chapter::findOrFail($chapterId);
        
        // Vérifier si l'utilisateur a accès au cours
        if (!$chapter->course->isAccessibleBy(auth()->user())) {
            return response()->json(['error' => 'Accès non autorisé à ce chapitre'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file_type' => 'required|in:pdf,video,image,document,link,audio,archive',
            'file' => 'required_unless:file_type,link|file|max:51200', // 50MB max
            'link_url' => 'required_if:file_type,link|url',
            'is_downloadable' => 'boolean',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'access_level' => 'in:free,enrolled,premium',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'duration_seconds' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['chapter_id'] = $chapterId;
        
        // Déterminer l'ordre
        $data['order_index'] = ChapterResource::where('chapter_id', $chapterId)->max('order_index') + 1;

        // Traitement du fichier ou lien
        if ($data['file_type'] === 'link') {
            $data['file_path'] = $data['link_url'];
            $data['original_filename'] = parse_url($data['link_url'], PHP_URL_HOST);
            $data['mime_type'] = 'text/html';
        } else {
            $file = $request->file('file');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                       . '.' . $file->getClientOriginalExtension();
            
            $path = $file->storeAs('chapter-resources', $filename, 'public');
            
            $data['file_path'] = $path;
            $data['original_filename'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        }

        // Valeurs par défaut
        $data['is_downloadable'] = $data['is_downloadable'] ?? true;
        $data['is_required'] = $data['is_required'] ?? false;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['access_level'] = $data['access_level'] ?? 'enrolled';
        $data['download_count'] = 0;
        $data['view_count'] = 0;

        $resource = ChapterResource::create($data);

        return response()->json([
            'message' => 'Ressource créée avec succès',
            'resource' => $resource
        ], 201);
    }

    /**
     * Afficher une ressource spécifique
     */
    public function show($chapterId, $resourceId)
    {
        $chapter = Chapter::findOrFail($chapterId);
        $resource = $chapter->resources()->findOrFail($resourceId);
        
        // Vérifier l'accès
        if (!$resource->isAccessibleBy(auth()->user())) {
            return response()->json(['error' => 'Accès non autorisé à cette ressource'], 403);
        }

        // Incrémenter le compteur de vues
        $resource->incrementViewCount();

        return response()->json([
            'resource' => [
                'id' => $resource->id,
                'title' => $resource->title,
                'description' => $resource->description,
                'file_type' => $resource->file_type,
                'file_icon' => $resource->file_icon,
                'file_url' => $resource->file_url,
                'original_filename' => $resource->original_filename,
                'formatted_file_size' => $resource->formatted_file_size,
                'formatted_duration' => $resource->formatted_duration,
                'mime_type' => $resource->mime_type,
                'is_downloadable' => $resource->is_downloadable,
                'is_required' => $resource->is_required,
                'is_active' => $resource->is_active,
                'access_level' => $resource->access_level,
                'download_count' => $resource->download_count,
                'view_count' => $resource->view_count,
                'metadata' => $resource->metadata,
                'available_from' => $resource->available_from,
                'available_until' => $resource->available_until,
                'created_at' => $resource->created_at,
            ]
        ]);
    }

    /**
     * Télécharger une ressource
     */
    public function download($chapterId, $resourceId)
    {
        $chapter = Chapter::findOrFail($chapterId);
        $resource = $chapter->resources()->findOrFail($resourceId);
        
        // Vérifier l'accès
        if (!$resource->isAccessibleBy(auth()->user())) {
            return response()->json(['error' => 'Accès non autorisé à cette ressource'], 403);
        }

        // Vérifier si téléchargeable
        if (!$resource->is_downloadable) {
            return response()->json(['error' => 'Cette ressource n\'est pas téléchargeable'], 403);
        }

        // Pour les liens, rediriger
        if ($resource->file_type === 'link') {
            return redirect($resource->file_path);
        }

        // Vérifier si le fichier existe
        if (!Storage::disk('public')->exists($resource->file_path)) {
            return response()->json(['error' => 'Fichier non trouvé'], 404);
        }

        // Incrémenter le compteur de téléchargements
        $resource->incrementDownloadCount();

        $filePath = storage_path('app/public/' . $resource->file_path);
        
        return response()->download(
            $filePath, 
            $resource->original_filename
        );
    }

    /**
     * Mettre à jour une ressource
     */
    public function update(Request $request, $chapterId, $resourceId)
    {
        // Seuls les formateurs et admins peuvent modifier des ressources
        if (!in_array(auth()->user()->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $chapter = Chapter::findOrFail($chapterId);
        $resource = $chapter->resources()->findOrFail($resourceId);

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'file' => 'file|max:51200', // 50MB max
            'link_url' => 'url',
            'is_downloadable' => 'boolean',
            'is_required' => 'boolean',
            'is_active' => 'boolean',
            'access_level' => 'in:free,enrolled,premium',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after_or_equal:available_from',
            'duration_seconds' => 'nullable|integer|min:0',
            'metadata' => 'nullable|array',
            'order_index' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Traitement du nouveau fichier si fourni
        if ($request->hasFile('file')) {
            // Supprimer l'ancien fichier si ce n'est pas un lien
            if ($resource->file_type !== 'link' && Storage::disk('public')->exists($resource->file_path)) {
                Storage::disk('public')->delete($resource->file_path);
            }

            $file = $request->file('file');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                       . '.' . $file->getClientOriginalExtension();
            
            $path = $file->storeAs('chapter-resources', $filename, 'public');
            
            $data['file_path'] = $path;
            $data['original_filename'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        }

        // Traitement du lien si fourni
        if ($request->has('link_url') && $resource->file_type === 'link') {
            $data['file_path'] = $data['link_url'];
            $data['original_filename'] = parse_url($data['link_url'], PHP_URL_HOST);
        }

        $resource->update($data);

        return response()->json([
            'message' => 'Ressource mise à jour avec succès',
            'resource' => $resource
        ]);
    }

    /**
     * Supprimer une ressource
     */
    public function destroy($chapterId, $resourceId)
    {
        // Seuls les formateurs et admins peuvent supprimer des ressources
        if (!in_array(auth()->user()->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $chapter = Chapter::findOrFail($chapterId);
        $resource = $chapter->resources()->findOrFail($resourceId);

        // Supprimer le fichier physique si ce n'est pas un lien
        if ($resource->file_type !== 'link' && Storage::disk('public')->exists($resource->file_path)) {
            Storage::disk('public')->delete($resource->file_path);
        }

        $resource->delete();

        return response()->json(['message' => 'Ressource supprimée avec succès']);
    }

    /**
     * Réorganiser les ressources d'un chapitre
     */
    public function reorder(Request $request, $chapterId)
    {
        // Seuls les formateurs et admins peuvent réorganiser
        if (!in_array(auth()->user()->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $chapter = Chapter::findOrFail($chapterId);

        $validator = Validator::make($request->all(), [
            'resources' => 'required|array',
            'resources.*.id' => 'required|integer|exists:chapter_resources,id',
            'resources.*.order_index' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        foreach ($request->resources as $resourceData) {
            ChapterResource::where('id', $resourceData['id'])
                          ->where('chapter_id', $chapterId)
                          ->update(['order_index' => $resourceData['order_index']]);
        }

        return response()->json(['message' => 'Ordre des ressources mis à jour avec succès']);
    }

    /**
     * Obtenir les statistiques des ressources d'un chapitre
     */
    public function stats($chapterId)
    {
        // Seuls les formateurs et admins peuvent voir les stats
        if (!in_array(auth()->user()->role, ['formateur', 'admin'])) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $chapter = Chapter::findOrFail($chapterId);
        $resources = $chapter->resources;

        $stats = [
            'total_resources' => $resources->count(),
            'by_type' => $resources->groupBy('file_type')->map->count(),
            'by_access_level' => $resources->groupBy('access_level')->map->count(),
            'total_downloads' => $resources->sum('download_count'),
            'total_views' => $resources->sum('view_count'),
            'required_resources' => $resources->where('is_required', true)->count(),
            'downloadable_resources' => $resources->where('is_downloadable', true)->count(),
            'active_resources' => $resources->where('is_active', true)->count(),
            'total_file_size' => $resources->sum('file_size'),
            'most_downloaded' => $resources->sortByDesc('download_count')->take(5)->values(),
            'most_viewed' => $resources->sortByDesc('view_count')->take(5)->values()
        ];

        return response()->json([
            'chapter' => [
                'id' => $chapter->id,
                'titre' => $chapter->titre
            ],
            'stats' => $stats
        ]);
    }
}
