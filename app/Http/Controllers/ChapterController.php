<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use App\Models\ChapterProgress;
use App\Models\Course;
use App\Models\ChapterResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChapterController extends Controller
{
    
    public function getAssignments($chapterId)
    {
        try {
            $user = Auth::user();
            $chapter = Chapter::findOrFail($chapterId);

            if(!$user->courses()->where('course_id', $chapter->course_id)->exists()){
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $assignments = $chapter->assignments()
                ->where('is_active', true)
                ->with(['submissions' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $assignments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des devoirs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
     * Mettre à jour la progression d'un cours
     */
    private function updateCourseProgress($userId, $courseId)
    {
        // Calculer le pourcentage de progression pour le cours
        $totalChapters = Chapter::where('course_id', $courseId)
            ->where('is_active', true)
            ->count();

        $readChapters = ChapterProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('is_read', true)
            ->count();

        $progressPercentage = $totalChapters > 0 ? ($readChapters / $totalChapters) * 100 : 0;

        // Mettre à jour la progression dans formation_enrollments
        $course = Course::find($courseId);
        if ($course) {
            $formationId = $course->formation_id;
            $enrollment = \App\Models\FormationEnrollment::where('user_id', $userId)
                ->where('formation_id', $formationId)
                ->first();
            if ($enrollment) {
                $updateData = [
                    'progress_percentage' => round($progressPercentage, 2),
                ];
                if ($progressPercentage >= 100 && !$enrollment->completed_at) {
                    $updateData['completed_at'] = now();
                }
                $enrollment->update($updateData);
            }
        }
    }

    /*
      Récupérer les chapitres d'un cours avec progression de l'utilisateur
     */
    public function getCourseChapters($courseId)
    {
        try {
            $user = Auth::user();

            // Récupérer le cours et sa formation
            $course = Course::with('formation')->findOrFail($courseId);

            // Vérifier si l'utilisateur est inscrit à la formation du cours
            $isEnrolled = \App\Models\FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $course->formation_id)
                ->exists();

            if (!$isEnrolled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas inscrit à la formation de ce cours'
                ], 403);
            }

            // Récupérer les chapitres avec la progression
            $chapters = Chapter::where('course_id', $courseId)
                ->orderBy('id')
                ->get()
                ->map(function ($chapter) use ($user) {
                    $progress = ChapterProgress::where('user_id', $user->id)
                        ->where('chapter_id', $chapter->id)
                        ->first();

                    return [
                        'id' => $chapter->id,
                        'titre' => $chapter->titre,
                        'description' => $chapter->description,
                        'is_read' => $progress ? $progress->is_read : false,
                        'reading_time_seconds' => $progress ? $progress->reading_time_seconds : 0,
                        'download_count' => $progress ? $progress->download_count : 0,
                        'first_read_at' => $progress ? $progress->first_read_at : null,
                        'last_read_at' => $progress ? $progress->last_read_at : null,
                        'file_path' => $chapter->file_path,
                        'file_url' => $chapter->file_url,
                        'has_file' => !empty($chapter->file_path),
                        'resources_count' => $chapter->resources()->count(),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $chapters
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des chapitres',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer un chapitre comme lu
     */
    public function markAsRead(Request $request, $chapterId)
    {
        try {
            $user = Auth::user();
            $chapter = Chapter::findOrFail($chapterId);

            // Log pour debug : vérifier l'id utilisateur et le cours
            Log::info('markAsRead', [
                'user_id' => $user->id,
                'chapter_id' => $chapterId,
                'course_id' => $chapter->course_id
            ]);

            // Vérifier l'inscription à la formation du cours
            $formationId = $chapter->course->formation_id;
            $isEnrolled = \App\Models\FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $formationId)
                ->exists();
            if (!$isEnrolled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé (formation)'
                ], 403);
            }

            // Mettre à jour ou créer la progression du chapitre
            $progress = ChapterProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'chapter_id' => $chapterId,
                    'course_id' => $chapter->course_id
                ],
                [
                    'is_read' => true,
                    'reading_time_seconds' => $request->input('reading_time_seconds', 0),
                    'first_read_at' => \DB::raw('COALESCE(first_read_at, NOW())'),
                    'last_read_at' => now(),
                ]
            );

            // Mettre à jour la progression globale du cours
            $this->updateCourseProgress($user->id, $chapter->course_id);

            return response()->json([
                'success' => true,
                'data' => $progress,
                'message' => 'Chapitre marqué comme lu'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un chapitre
     */
    public function downloadChapter($chapterId)
    {
        try {
            $user = Auth::user();
            $chapter = Chapter::findOrFail($chapterId);

            // Vérifier l'inscription à la formation du cours
            $formationId = $chapter->course->formation_id;
            $isEnrolled = \App\Models\FormationEnrollment::where('user_id', $user->id)
                ->where('formation_id', $formationId)
                ->exists();
            if (!$isEnrolled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé (formation)'
                ], 403);
            }

            // Vérifier si le fichier existe
            if (!$chapter->file_path || !Storage::exists($chapter->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fichier non trouvé'
                ], 404);
            }

            // Mettre à jour le compteur de téléchargements
            $this->updateDownloadCount($chapterId);

            return Storage::download($chapter->file_path, $chapter->titre . '.pdf');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le compteur de téléchargements
     */
    public function updateDownloadCount($chapterId)
    {
        try {
            $user = Auth::user();
            $chapter = Chapter::findOrFail($chapterId);

            ChapterProgress::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'chapter_id' => $chapterId,
                    'course_id' => $chapter->course_id
                ],
                []
            )->increment('download_count');

            return response()->json([
                'success' => true,
                'message' => 'Compteur mis à jour'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau chapitre avec gestion complète des fichiers
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Validation des données
            $validator = Validator::make($request->all(), [
                'titre' => 'required|string|max:255',
                'description' => 'nullable|string',
                'course_id' => 'required|exists:courses,id',
                'file' => 'nullable|file|max:51200', // 50MB max
                'video_url' => 'nullable|url',
                'order_index' => 'nullable|integer',
                'duration_minutes' => 'nullable|integer',
                'is_active' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérifier que l'utilisateur est propriétaire du cours
            $course = Course::find($request->course_id);
            if (!$course) {
                \Log::error('[ChapterController@store] Course not found', ['course_id' => $request->course_id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Cours introuvable'
                ], 404);
            }
            if (!$course->formation || $course->formation->teacher_id !== $user->id) {
                \Log::warning('[ChapterController@store] Accès refusé : pas propriétaire', [
                    'teacher_id' => $course->formation->teacher_id ?? null,
                    'user_id' => $user->id,
                    'course_id' => $course->id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez créer des chapitres que pour vos propres cours'
                ], 403);
            }

            // Gestion de l'upload de fichier
            $filePath = null;
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                
                // Générer un nom unique pour le fichier
                $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                           . '.' . $file->getClientOriginalExtension();
                
                // Stocker le fichier dans le dossier chapters
                $filePath = $file->storeAs('chapters', $filename, 'public');
                
                \Log::info('Fichier uploadé:', [
                    'original_name' => $file->getClientOriginalName(),
                    'stored_path' => $filePath,
                    'size' => $file->getSize()
                ]);
            }

            // Créer le chapitre
            $chapter = Chapter::create([
                'titre' => $request->titre,
                'description' => $request->description,
                'course_id' => $request->course_id,
                'file_path' => $filePath,
                'video_url' => $request->video_url,
                'order_index' => $request->order_index,
                'duration_minutes' => $request->duration_minutes,
                'is_active' => $request->is_active ?? true,
            ]);

            // Si un fichier a été uploadé, créer automatiquement une ressource associée
            if ($filePath && $request->hasFile('file')) {
                $file = $request->file('file');
                
                ChapterResource::create([
                    'chapter_id' => $chapter->id,
                    'title' => 'Document principal - ' . $request->titre,
                    'description' => 'Document principal du chapitre',
                    'file_path' => $filePath,
                    'original_filename' => $file->getClientOriginalName(),
                    'file_type' => $this->determineFileType($file->getMimeType()),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'is_downloadable' => true,
                    'is_required' => false,
                    'is_active' => true,
                    'access_level' => 'enrolled',
                    'order_index' => 1,
                    'download_count' => 0,
                    'view_count' => 0
                ]);
            }

            // Charger les relations pour la réponse
            $chapter->load('course.formation', 'resources');

            return response()->json([
                'success' => true,
                'data' => $chapter,
                'message' => 'Chapitre créé avec succès'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur création chapitre:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du chapitre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Déterminer le type de fichier basé sur le MIME type
     */
    private function determineFileType($mimeType)
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        } elseif ($mimeType === 'application/pdf') {
            return 'pdf';
        } elseif (in_array($mimeType, ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'])) {
            return 'archive';
        } else {
            return 'document';
        }
    }

    /**
     * Mettre à jour un chapitre
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $chapter = Chapter::find($id);
            if (!$chapter) {
                \Log::error('[ChapterController@update] Chapter not found', ['chapter_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Chapitre introuvable'
                ], 404);
            }
            if (!$chapter->course || !$chapter->course->formation || $chapter->course->formation->teacher_id !== $user->id) {
                \Log::warning('[ChapterController@update] Accès refusé : pas propriétaire', [
                    'teacher_id' => $chapter->course->formation->teacher_id ?? null,
                    'user_id' => $user->id,
                    'course_id' => $chapter->course->id ?? null
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier que vos propres chapitres'
                ], 403);
            }

            // Validation des données
            $validator = Validator::make($request->all(), [
                'titre' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'file' => 'nullable|file|max:51200' // 50MB max
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Mettre à jour les champs texte
            $chapter->update($request->only(['titre', 'description']));

            // Gestion de l'importation d'un nouveau fichier
            if ($request->hasFile('file')) {
                $file = $request->file('file');

                // Supprimer l'ancien fichier si présent
                if ($chapter->file_path && \Storage::disk('public')->exists($chapter->file_path)) {
                    \Storage::disk('public')->delete($chapter->file_path);
                }

                // Générer un nom unique pour le nouveau fichier
                $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
                           . '.' . $file->getClientOriginalExtension();

                // Stocker le nouveau fichier
                $filePath = $file->storeAs('chapters', $filename, 'public');

                // Mettre à jour le champ file_path
                $chapter->file_path = $filePath;
                $chapter->save();
            }

            // Charger les relations pour la réponse
            $chapter->load('course.formation', 'resources');

            return response()->json([
                'success' => true,
                'data' => $chapter,
                'message' => 'Chapitre mis à jour avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du chapitre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un chapitre
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $chapter = Chapter::find($id);
            if (!$chapter) {
                \Log::error('[ChapterController@destroy] Chapter not found', ['chapter_id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Chapitre introuvable'
                ], 404);
            }
            if (!$chapter->course || !$chapter->course->formation || $chapter->course->formation->teacher_id !== $user->id) {
                \Log::warning('[ChapterController@destroy] Accès refusé : pas propriétaire', [
                    'teacher_id' => $chapter->course->formation->teacher_id ?? null,
                    'user_id' => $user->id,
                    'course_id' => $chapter->course->id ?? null
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez supprimer que vos propres chapitres'
                ], 403);
            }

            // Supprimer le fichier physique s'il existe
            if ($chapter->file_path && Storage::disk('public')->exists($chapter->file_path)) {
                Storage::disk('public')->delete($chapter->file_path);
            }

            // Supprimer les ressources associées et leurs fichiers
            foreach ($chapter->resources as $resource) {
                if ($resource->file_path && $resource->file_type !== 'link' && Storage::disk('public')->exists($resource->file_path)) {
                    Storage::disk('public')->delete($resource->file_path);
                }
            }

            // Supprimer le chapitre (les ressources seront supprimées en cascade)
            $chapter->delete();

            return response()->json([
                'success' => true,
                'message' => 'Chapitre supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du chapitre',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les chapitres d'un cours pour le formateur
     */
    public function index($courseId = null)
    {
        try {
            $user = Auth::user();
            \Log::debug('[Chapters@index] user', ['id' => $user->id, 'email' => $user->email]);
            \Log::debug('[Chapters@index] courseId', ['courseId' => $courseId]);
            if ($courseId) {
                // Récupérer les chapitres d'un cours spécifique
                $course = Course::find($courseId);
                if (!$course) {
                    \Log::error('[Chapters@index] Course not found', ['courseId' => $courseId]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Cours introuvable'
                    ], 404);
                }
                \Log::debug('[Chapters@index] course', ['id' => $course->id, 'formation_id' => $course->formation_id]);
                // Vérifier que l'utilisateur est propriétaire du cours
                if (!$course->formation || $course->formation->teacher_id !== $user->id) {
                    \Log::warning('[Chapters@index] Accès refusé : pas propriétaire', ['teacher_id' => $course->formation->teacher_id ?? null, 'user_id' => $user->id]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous ne pouvez voir que vos propres chapitres'  
                    ], 403);
                }
                $chapters = Chapter::where('course_id', $courseId)
                    ->with(['resources'])
                    ->orderBy('id')
                    ->get()
                    ->map(function($chapter) {
                        \Log::debug('[Chapters@index] chapitre', ['id' => $chapter->id, 'titre' => $chapter->titre]);
                        return [
                            'id' => $chapter->id,
                            'titre' => $chapter->titre,
                            'description' => $chapter->description,
                            'course_id' => $chapter->course_id,
                            'file_path' => $chapter->file_path,
                            'has_file' => !empty($chapter->file_path),
                            'resources_count' => $chapter->resources->count(),
                            'created_at' => $chapter->created_at,
                            'updated_at' => $chapter->updated_at
                        ];
                    });
            } else {
                // Récupérer tous les chapitres du formateur
                $chapters = Chapter::whereHas('course.formation', function($query) use ($user) {
                    $query->where('teacher_id', $user->id);
                })->with(['resources', 'course'])
                ->orderBy('id')
                ->get()
                ->map(function($chapter) {
                    \Log::debug('[Chapters@index] chapitre', ['id' => $chapter->id, 'titre' => $chapter->titre]);
                    return [
                        'id' => $chapter->id,
                        'titre' => $chapter->titre,
                        'description' => $chapter->description,
                        'course_id' => $chapter->course_id,
                        'course_name' => $chapter->course->title ?? 'N/A',
                        'file_path' => $chapter->file_path,
                        'has_file' => !empty($chapter->file_path),
                        'resources_count' => $chapter->resources->count(),
                        'created_at' => $chapter->created_at,
                        'updated_at' => $chapter->updated_at
                    ];
                });
            }
            \Log::debug('[Chapters@index] chapters count', ['count' => count($chapters)]);
            return response()->json([
                'success' => true,
                'data' => $chapters
            ]);
        } catch (\Exception $e) {
            \Log::error('[Chapters@index] Exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des chapitres',
                'error' => $e->getMessage()
            ], 500);
        }
}
}