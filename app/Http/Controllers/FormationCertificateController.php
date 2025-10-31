<?php

namespace App\Http\Controllers;

use App\Models\FormationCertificate;
use App\Models\Formation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class FormationCertificateController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Récupérer tous les certificats de formation de l'utilisateur connecté
     */
    public function getMyCertificates(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $certificates = FormationCertificate::with(['formation', 'issuedBy'])
                ->where('user_id', $user->id)
                ->when($request->formation_id, function ($query, $formationId) {
                    return $query->where('formation_id', $formationId);
                })
                ->when($request->certificate_level, function ($query, $level) {
                    return $query->where('certificate_level', $level);
                })
                ->when($request->is_valid !== null, function ($query) use ($request) {
                    return $query->where('is_valid', $request->boolean('is_valid'));
                })
                ->orderBy('certificate_issued_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $certificates,
                'message' => 'Certificats de formation récupérés avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des certificats de formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les certificats de formation d'un utilisateur spécifique (admin/formateur)
     */
    public function getUserCertificates(Request $request, $userId): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Vérifier les permissions
            if (!in_array($user->role, ['admin', 'formateur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $certificates = FormationCertificate::with(['formation', 'user', 'issuedBy'])
                ->where('user_id', $userId)
                ->when($request->formation_id, function ($query, $formationId) {
                    return $query->where('formation_id', $formationId);
                })
                ->orderBy('certificate_issued_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $certificates,
                'message' => 'Certificats de formation de l\'utilisateur récupérés avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des certificats de formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau certificat de formation
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Seuls les formateurs et admins peuvent créer des certificats
            if (!in_array($user->role, ['admin', 'formateur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'formation_id' => 'required|exists:formations,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'overall_grade' => 'nullable|numeric|min:0|max:100',
                'total_hours_completed' => 'required|integer|min:0',
                'total_courses_completed' => 'required|integer|min:0',
                'course_certificates' => 'nullable|array',
                'course_certificates.*' => 'exists:course_certificates,id',
                'skills_acquired' => 'nullable|array',
                'competency_scores' => 'nullable|array',
                'formation_started_at' => 'nullable|date',
                'formation_completed_at' => 'required|date',
                'certificate_expires_at' => 'nullable|date|after:today',
                'certificate_template' => 'nullable|string',
                'certificate_level' => ['required', Rule::in(['completion', 'excellence', 'distinction'])],
                'digital_signature' => 'nullable|string',
                'metadata' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Vérifier qu'un certificat n'existe pas déjà pour cette formation et cet utilisateur
            $existingCertificate = FormationCertificate::where('user_id', $request->user_id)
                ->where('formation_id', $request->formation_id)
                ->first();

            if ($existingCertificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un certificat existe déjà pour cette formation et cet utilisateur'
                ], 409);
            }

            $certificateData = $request->all();
            $certificateData['issued_by'] = $user->id;
            $certificateData['certificate_number'] = FormationCertificate::generateCertificateNumber();
            $certificateData['verification_code'] = FormationCertificate::generateVerificationCode();
            $certificateData['certificate_issued_at'] = now();

            $certificate = FormationCertificate::create($certificateData);
            $certificate->load(['formation', 'user', 'issuedBy']);

            return response()->json([
                'success' => true,
                'data' => $certificate,
                'message' => 'Certificat de formation créé avec succès'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du certificat de formation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger un certificat de formation
     */
    public function download($id)
    {
        try {
            $user = Auth::user();
            
            $certificate = FormationCertificate::with(['formation', 'user', 'issuedBy'])
                ->findOrFail($id);

            // Vérifier les permissions
            if ($certificate->user_id !== $user->id && !in_array($user->role, ['admin', 'formateur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            if (!$certificate->is_valid) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce certificat n\'est plus valide'
                ], 400);
            }

            if ($certificate->isExpired()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce certificat a expiré'
                ], 400);
            }

            // Incrémenter le compteur de téléchargements
            $certificate->increment('download_count');
            $certificate->update(['last_downloaded_at' => now()]);

            // Si le fichier PDF existe, le servir
            if ($certificate->certificate_file_path && Storage::disk('certificates')->exists($certificate->certificate_file_path)) {
                return response()->download(Storage::disk('certificates')->path($certificate->certificate_file_path));
            }

            // Sinon, générer le PDF (implémentation à faire selon vos besoins)
            return response()->json([
                'success' => true,
                'message' => 'Certificat téléchargé avec succès',
                'download_url' => url('/api/formation-certificates/' . $id . '/generate-pdf'),
                'certificate' => $certificate
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier un certificat de formation avec son code de vérification
     */
    public function verify($verificationCode): JsonResponse
    {
        try {
            $certificate = FormationCertificate::with(['formation', 'user', 'issuedBy'])
                ->where('verification_code', $verificationCode)
                ->first();

            if (!$certificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificat non trouvé'
                ], 404);
            }

            $isValid = $certificate->is_valid && !$certificate->isExpired();

            // Ajouter une entrée dans le log de vérification
            $verificationLog = $certificate->verification_log ?? [];
            $verificationLog[] = [
                'verified_at' => now(),
                'verified_by_ip' => request()->ip(),
                'result' => $isValid ? 'valid' : 'invalid'
            ];
            $certificate->update(['verification_log' => $verificationLog]);

            return response()->json([
                'success' => true,
                'data' => [
                    'certificate' => $certificate,
                    'is_valid' => $isValid,
                    'is_expired' => $certificate->isExpired(),
                    'verification_date' => now()
                ],
                'message' => $isValid ? 'Certificat valide' : 'Certificat invalide ou expiré'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Invalider un certificat de formation (admin seulement)
     */
    public function invalidate($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les administrateurs peuvent invalider des certificats'
                ], 403);
            }

            $certificate = FormationCertificate::findOrFail($id);
            $certificate->update(['is_valid' => false]);

            return response()->json([
                'success' => true,
                'data' => $certificate,
                'message' => 'Certificat invalidé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'invalidation du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Regénérer un certificat de formation
     */
    public function regenerate($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!in_array($user->role, ['admin', 'formateur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $certificate = FormationCertificate::findOrFail($id);
            
            // Générer un nouveau code de vérification
            $certificate->update([
                'verification_code' => FormationCertificate::generateVerificationCode(),
                'certificate_issued_at' => now(),
                'certificate_file_path' => null, // Forcer la régénération du PDF
                'download_count' => 0
            ]);

            $certificate->load(['formation', 'user', 'issuedBy']);

            return response()->json([
                'success' => true,
                'data' => $certificate,
                'message' => 'Certificat régénéré avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la régénération du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des certificats de formation
     */
    public function getStats(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!in_array($user->role, ['admin', 'formateur'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], 403);
            }

            $query = FormationCertificate::query();

            // Filtrer par formateur si ce n'est pas un admin
            if ($user->role === 'formateur') {
                $query->where('issued_by', $user->id);
            }

            $stats = [
                'total_certificates' => $query->count(),
                'valid_certificates' => $query->where('is_valid', true)->count(),
                'expired_certificates' => $query->whereNotNull('certificate_expires_at')
                    ->where('certificate_expires_at', '<', now())->count(),
                'certificates_this_month' => $query->whereMonth('certificate_issued_at', now()->month)
                    ->whereYear('certificate_issued_at', now()->year)->count(),
                'total_downloads' => $query->sum('download_count'),
                'average_grade' => $query->whereNotNull('overall_grade')->avg('overall_grade'),
                'certificates_by_level' => [
                    'completion' => $query->where('certificate_level', 'completion')->count(),
                    'excellence' => $query->where('certificate_level', 'excellence')->count(),
                    'distinction' => $query->where('certificate_level', 'distinction')->count()
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistiques récupérées avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un certificat de formation (admin seulement)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Seuls les administrateurs peuvent supprimer des certificats'
                ], 403);
            }

            $certificate = FormationCertificate::findOrFail($id);
            
            // Supprimer le fichier PDF s'il existe
            if ($certificate->certificate_file_path && Storage::disk('certificates')->exists($certificate->certificate_file_path)) {
                Storage::disk('certificates')->delete($certificate->certificate_file_path);
            }

            $certificate->delete();

            return response()->json([
                'success' => true,
                'message' => 'Certificat de formation supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du certificat',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
