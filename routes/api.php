<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AdminProfileController;
use App\Http\Controllers\TeacherProfileController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AssignmentSubmissionController;
use App\Http\Controllers\ChapterResourceController;
use App\Http\Controllers\FormationController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\TeacherFeedbackController;
use App\Http\Controllers\StudentFeedbackController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\AdminController;



Route::middleware(['auth:api'])->get('/user', function (Request $request) {
    return $request->user();
});

// la connexion à la base de donnée epg :

Route::get('/check-db-connection', function () {
    try {
        DB::connection()->getPdo();
        return response()->json(['status' => 'success', 'message' => 'Connexion à la base de données réussie ✅']);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => 'Connexion échouée  : ' . $e->getMessage()]);
    }
});

Route::post('/register', [AuthController::class, 'register']);

// Route protégée pour la création d'utilisateurs (formateur, admin) par un super admin ou admin
Route::middleware(['auth:api'])->post('/admin/register', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:api'])->group(function () {
    //  PROFILS ÉTUDIANTS - Sécurisés par rôles
    Route::get('/student-profiles', [StudentProfileController::class, 'index']); // Admin/Formateur uniquement
    Route::get('/student-profiles/{user_id}', [StudentProfileController::class, 'show']); // Propriétaire/Admin/Formateur
    Route::post('/student-profiles', [StudentProfileController::class, 'store']); // Créer son propre profil
    Route::put('/student-profiles/{user_id}', [StudentProfileController::class, 'update']); // Propriétaire/Admin/Formateur
    Route::delete('/student-profiles/{user_id}', [StudentProfileController::class, 'destroy']); // Admin uniquement

    //  Route spéciale : Mon profil étudiant (pour l'utilisateur connecté)
    Route::get('/my-student-profile', [StudentProfileController::class, 'myProfile']);
    Route::put('/my-student-profile', [StudentProfileController::class, 'updateMyProfile']);
});

// Routes Formateur (Teacher Profiles) - Sécurisées
Route::middleware('auth:api')->group(function () {
    Route::get('/teacher-profiles', [TeacherProfileController::class, 'index']); // Admin uniquement
    Route::get('/teacher-profiles/{user_id}', [TeacherProfileController::class, 'show']); // Propriétaire/Admin
    Route::put('/teacher-profiles/{user_id}', [TeacherProfileController::class, 'update']); // Propriétaire/Admin
    Route::delete('/teacher-profiles/{user_id}', [TeacherProfileController::class, 'destroy']); // Admin uniquement
    Route::post('/teacher-profiles/{user_id}/verify', [TeacherProfileController::class, 'verify']); // Admin seulement
    Route::get('/teacher-profiles/stats/{user_id}', [TeacherProfileController::class, 'stats']);
    
    // Route spéciale : Mon profil formateur (pour l'utilisateur connecté)
    Route::get('/my-profile-teacher', [TeacherProfileController::class, 'myProfile']);
    Route::put('/my-profile-teacher', [TeacherProfileController::class, 'updateMyProfile']);

     // Récupérer la note d'un étudiant pour un cours
    Route::get('/evaluations/{courseId}/{studentId}', [EvaluationController::class, 'show']);
    // Créer ou mettre à jour la note d'un étudiant pour un cours
    Route::post('/evaluations/{courseId}/{studentId}', [EvaluationController::class, 'storeOrUpdate']);
});

// Routes Admin : accessibles à admin ET super_admin
// Utilisation directe de la classe middleware pour éviter les soucis d'alias
Route::middleware(['auth:api', \App\Http\Middleware\AdminOrSuperAdminMiddleware::class])->group(function () {
    Route::get('/admin-profiles', [AdminProfileController::class, 'index']);
    Route::get('/admin-profiles/{user_id}', [AdminProfileController::class, 'show']);
    Route::put('/admin-profiles/{user_id}', [AdminProfileController::class, 'update']);
    Route::delete('/admin-profiles/{user_id}', [AdminProfileController::class, 'destroy']);
    
    // Retourne les formateurs non-admins (role = 'formateur')
    Route::get('/users/non-admins', [\App\Http\Controllers\UserController::class, 'nonAdmins']);

    // Route spéciale : Mon profil admin (pour l'utilisateur admin connecté)
    Route::get('/my-admin-profile', [AdminProfileController::class, 'myProfile']);
    Route::put('/my-admin-profile', [AdminProfileController::class, 'updateMyProfile']);

    // Statistiques d'activité utilisateur
    Route::get('/admin/stats/user-activity', [\App\Http\Controllers\UserController::class, 'getUserActivityStats']);
});

Route::get('/admins', [AdminController::class, 'index']);

// Routes de promotion/révocation d'admin : super_admin uniquement
Route::middleware(['auth:api', \App\Http\Middleware\AdminOrSuperAdminMiddleware::class . ':super_admin'])->group(function () {
    Route::post('/admin/promote', [AdminProfileController::class, 'promoteToAdmin']);
    Route::post('/admin/promote-superadmin', [AdminProfileController::class, 'promoteToSuperAdmin']);
    Route::post('/admin/revoke', [AdminProfileController::class, 'revokeAdmin']);
});


// Routes pour les cours
Route::middleware('auth:api')->group(function () {
    // Cours suivis par l'utilisateur connecté
    Route::get('/courses/followed', [CourseController::class, 'getFollowedCourses']);
    
    // Tous les cours disponibles
    Route::get('/courses', [CourseController::class, 'index']);

    // Incrémenter le nombre de vues d'un cours
    Route::post('/courses/{course}/view', [CourseController::class, 'incrementView']);
    
    // S'inscrire à un cours
    Route::post('/courses/{courseId}/enroll', [CourseController::class, 'enrollToCourse']);
    
    // Mettre à jour le progrès d'un cours
    Route::put('/courses/{courseId}/progress', [CourseController::class, 'updateCourseProgress']);
    
    // Se désinscrire d'un cours
    Route::delete('/courses/{courseId}/unenroll', [CourseController::class, 'unenrollFromCourse']);
    
    // Statistiques des cours de l'utilisateur
    Route::get('/courses/stats', [CourseController::class, 'getCourseStats']);
    
    // CRUD des cours (pour admin plus tard)
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);
});

// Routes pour les chapitres
Route::middleware('auth:api')->group(function () {
    // Récupérer les chapitres d'un cours (étudiants)
    Route::get('/courses/{course}/chapters', [ChapterController::class, 'getCourseChapters']);

    // Récupérer les chapitres d'un cours (formateurs propriétaires)
});

// Route pour récupérer mes cours (pour formateurs)
Route::middleware('auth:api')->get('/my-courses', [CourseController::class, 'myCourses']);
Route::get('/courses/{course}/chapters/manage', [ChapterController::class, 'index']);

// Créer un chapitre
Route::middleware('auth:api')->post('/chapters', [ChapterController::class, 'store']);

// Modifier un chapitre
Route::middleware('auth:api')->put('/chapters/{chapter}', [ChapterController::class, 'update']);

// Supprimer un chapitre
Route::delete('/chapters/{chapter}', [ChapterController::class, 'destroy']);

// Marquer comme lu
Route::post('/chapters/{chapter}/mark-read', [ChapterController::class, 'markAsRead']);

// Télécharger le fichier du chapitre
Route::get('/chapters/{chapter}/download', [ChapterController::class, 'downloadChapter']);

// Mettre à jour le compteur de téléchargements
Route::post('/chapters/{chapter}/update-download-count', [ChapterController::class, 'updateDownloadCount']);

// Récupérer les devoirs d'un chapitre
Route::get('/chapters/{chapter}/assignments', [ChapterController::class, 'getAssignments']);

// Gestion des ressources associées au chapitre
Route::get('/chapters/{chapter}/resources', [ChapterResourceController::class, 'index']);
Route::post('/chapters/{chapter}/resources', [ChapterResourceController::class, 'store']);
Route::get('/chapters/{chapter}/resources/{resource}', [ChapterResourceController::class, 'show']);
Route::put('/chapters/{chapter}/resources/{resource}', [ChapterResourceController::class, 'update']);
Route::delete('/chapters/{chapter}/resources/{resource}', [ChapterResourceController::class, 'destroy']);
Route::get('/chapters/{chapter}/resources/{resource}/download', [ChapterResourceController::class, 'download']);
Route::put('/chapters/{chapter}/resources/reorder', [ChapterResourceController::class, 'reorder']);
Route::get('/chapters/{chapter}/resources/stats', [ChapterResourceController::class, 'stats']);


// Route protégée pour les stats globales formations (avant la route dynamique)
Route::middleware(['auth:api', \App\Http\Middleware\AdminOrSuperAdminMiddleware::class])->group(function () {
    Route::get('/formations/global-stats', [FormationController::class, 'globalStats']);
});

// Routes pour les formations
Route::middleware('auth:api')->group(function () {
    // Toutes les formations (publiques)
    Route::get('/formations', [FormationController::class, 'index']);
    
    // Mes formations (pour formateurs)
    Route::get('/my-formations', [FormationController::class, 'myFormations']);
    
    // Mes cours (pour formateurs)
    Route::get('/my-courses', [CourseController::class, 'myCourses']);
    
    // Détails d'une formation
    Route::get('/formations/{id}', [FormationController::class, 'show']);
    
    // Créer une formation (formateurs)
    Route::post('/formations', [FormationController::class, 'store']);
    
    // Modifier une formation (propriétaire seulement)
    Route::put('/formations/{id}', [FormationController::class, 'update']);
    
    // Supprimer une formation (propriétaire seulement)
    Route::delete('/formations/{id}', [FormationController::class, 'destroy']);
    
    // Statistiques d'une formation
    Route::get('/formations/{id}/stats', [FormationController::class, 'stats']);

    // Inscription à une formation (étudiant)
    // Route corrigée pour utiliser EnrollmentController@enrollToFormation
    Route::post('/formations/enroll', [EnrollmentController::class, 'enrollToFormation']);
});

// Routes pour les inscriptions aux formations (étudiants)
Route::middleware('auth:api')->group(function () {
    // Récupérer mes inscriptions aux formations (avec détails des formations)
    Route::get('/user/enrollments', [EnrollmentController::class, 'getMyEnrollments']);
    // S'inscrire à une formation
    Route::post('/formation-enrollments', [EnrollmentController::class, 'enrollToFormation']);
    // Se désinscrire d'une formation (si nécessaire)
    Route::delete('/formation-enrollments/{enrollmentId}', [EnrollmentController::class, 'unenrollFromFormation']);
    // Mettre à jour la progression d'une formation
    Route::put('/formation-enrollments/{enrollmentId}/progress', [EnrollmentController::class, 'updateProgress']);
    // Récupérer les cours d'une formation spécifique (pour étudiants inscrits)
    Route::get('/student/formations/{formationId}/courses', [CourseController::class, 'getFormationCoursesForStudent']);
    // Marquer un cours comme consulté/progressé
    Route::post('/student/courses/{courseId}/mark-progress', [CourseController::class, 'markCourseProgress']);
    // Récupérer la progression détaillée d'un étudiant pour un cours
    Route::get('/student/courses/{courseId}/progress', [CourseController::class, 'getCourseProgressForStudent']);
});

Route::get('/formationPublique', [FormationController::class, 'publicIndex']);
// Routes pour les catégories
Route::middleware('auth:api')->group(function () {
    // Liste de toutes les catégories (public pour les dropdowns)
    Route::get('/categories', [CategoryController::class, 'index']);
    
    // Détails d'une catégorie
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    
    // CRUD pour admin seulement (à sécuriser plus tard avec des middlewares de rôle)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
});


// Routes pour les devoirs (assignments)
Route::middleware('auth:api')->group(function () {
    // Récupérer les devoirs selon le rôle
    Route::get('/assignments', [AssignmentController::class, 'index']);

    // Créer un devoir (formateur) - utilisez storeTeacherAssignment
    Route::post('/assignments', [AssignmentController::class, 'storeTeacherAssignment']);

    // Soumettre un devoir (étudiant)
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submitStudentAssignment']);

    // Récupérer les devoirs d'un cours spécifique
    Route::get('/courses/{course_id}/assignments', [AssignmentController::class, 'getCourseAssignments']);

    // Supprimer un devoir
    Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);
    
    // Mettre à jour un devoir (si vous avez cette fonctionnalité)
    Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
});

// Routes pour les soumissions de devoirs
Route::middleware('auth:api')->group(function () {
    // Soumettre un devoir
    Route::post('/assignments/{assignment_id}/submit', [AssignmentSubmissionController::class, 'submit']);
    
    // Récupérer les soumissions d'un devoir (formateurs/admin)
    Route::get('/assignments/{assignment_id}/submissions', [AssignmentSubmissionController::class, 'getSubmissions']);
    
    // Noter une soumission (formateurs/admin)
    Route::post('/submissions/{submission_id}/grade', [AssignmentSubmissionController::class, 'grade']);
    
    // Mes soumissions (étudiants)
    Route::get('/my-submissions', [AssignmentSubmissionController::class, 'getMySubmissions']);
});

// Routes pour les ressources de chapitre
Route::middleware('auth:api')->group(function () {
    // Lister les ressources d'un chapitre
    Route::get('/chapters/{chapter_id}/resources', [ChapterResourceController::class, 'index']);
    
    // Créer une ressource (formateurs/admin)
    Route::post('/chapters/{chapter_id}/resources', [ChapterResourceController::class, 'store']);
    
    // Afficher une ressource spécifique
    Route::get('/chapters/{chapter_id}/resources/{resource_id}', [ChapterResourceController::class, 'show']);
    
    // Télécharger une ressource
    Route::get('/chapters/{chapter_id}/resources/{resource_id}/download', [ChapterResourceController::class, 'download']);
    
    // Mettre à jour une ressource (formateurs/admin)
    Route::put('/chapters/{chapter_id}/resources/{resource_id}', [ChapterResourceController::class, 'update']);
    
    // Supprimer une ressource (formateurs/admin)
    Route::delete('/chapters/{chapter_id}/resources/{resource_id}', [ChapterResourceController::class, 'destroy']);
    
    // Réorganiser les ressources d'un chapitre (formateurs/admin)
    Route::put('/chapters/{chapter_id}/resources/reorder', [ChapterResourceController::class, 'reorder']);
    
    // Statistiques des ressources d'un chapitre (formateurs/admin)
    Route::get('/chapters/{chapter_id}/resources/stats', [ChapterResourceController::class, 'stats']);
});

// Routes pour les feedbacks d'étudiants
Route::middleware('auth:api')->group(function () {
    // Mes feedbacks donnés (étudiant)
    Route::get('/my-student-feedbacks', [StudentFeedbackController::class, 'getMyFeedbacks']);
    
    // Feedbacks publics d'un cours
    Route::get('/courses/{courseId}/feedbacks', [StudentFeedbackController::class, 'getCourseFeedbacks']);
    
    // Feedbacks publics d'un formateur
    Route::get('/teachers/{teacherId}/feedbacks', [StudentFeedbackController::class, 'getTeacherFeedbacks']);
    
    // Créer un feedback (étudiant)
    Route::post('/student-feedbacks', [StudentFeedbackController::class, 'store']);
    
    // Modifier un feedback (étudiant/admin)
    Route::put('/student-feedbacks/{id}', [StudentFeedbackController::class, 'update']);
    
    // Mon feedback pour un cours spécifique
    Route::get('/courses/{courseId}/my-feedback', [StudentFeedbackController::class, 'getMyCourseFeedback']);
    
    // Statistiques des feedbacks (admin/formateur)
    Route::get('/student-feedbacks/stats', [StudentFeedbackController::class, 'getStats']);
    
    // Modérer un feedback (admin)
    Route::post('/student-feedbacks/{id}/moderate', [StudentFeedbackController::class, 'moderate']);
    
    // Supprimer un feedback
    Route::delete('/student-feedbacks/{id}', [StudentFeedbackController::class, 'destroy']);
});

// Routes pour les feedbacks de formateurs
Route::middleware('auth:api')->group(function () {
    // Mes feedbacks donnés (formateur)
    Route::get('/my-teacher-feedbacks', [TeacherFeedbackController::class, 'getMyFeedbacks']);
    
    // Feedbacks reçus par un étudiant
    Route::get('/students/{studentId}/feedbacks', [TeacherFeedbackController::class, 'getStudentFeedbacks']);
    
    // Créer un feedback (formateur)
    Route::post('/teacher-feedbacks', [TeacherFeedbackController::class, 'store']);
    
    // Modifier un feedback (formateur/admin)
    Route::put('/teacher-feedbacks/{id}', [TeacherFeedbackController::class, 'update']);
    
    // Marquer comme lu (étudiant)
    Route::post('/teacher-feedbacks/{id}/read', [TeacherFeedbackController::class, 'markAsRead']);
    
    // Statistiques des feedbacks (formateur/admin)
    Route::get('/teacher-feedbacks/stats', [TeacherFeedbackController::class, 'getStats']);
    
    // Création en lot (formateur)
    Route::post('/teacher-feedbacks/bulk', [TeacherFeedbackController::class, 'createBulk']);
    
    // Supprimer un feedback
    Route::delete('/teacher-feedbacks/{id}', [TeacherFeedbackController::class, 'destroy']);
});




