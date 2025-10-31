# 🚨 ROUTES API MANQUANTES - À AJOUTER DANS routes/api.php

## ⚠️ URGENT : Ces routes sont utilisées par les hooks mais n'existent pas encore dans l'API

### 1. 👥 ROUTES UTILISATEURS (useUsers.js)
```php
Route::middleware('auth:api')->group(function () {
    // CRUD utilisateurs (admin seulement)
    Route::get('/users', [UserController::class, 'index']); // ✅ Déjà utilisée
    Route::post('/users', [UserController::class, 'store']); // ✅ Déjà utilisée  
    Route::put('/users/{id}', [UserController::class, 'update']); // ✅ Déjà utilisée
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // ✅ Déjà utilisée
    Route::patch('/users/{id}/status', [UserController::class, 'toggleStatus']); // ❌ MANQUANTE
});
```

### 2. 🎯 ROUTES FORMATIONS (useFormations.js)
```php
Route::middleware('auth:api')->group(function () {
    // CRUD formations
    Route::get('/formations', [FormationController::class, 'index']); // ❌ MANQUANTE
    Route::post('/formations', [FormationController::class, 'store']); // ❌ MANQUANTE
    Route::get('/formations/{id}', [FormationController::class, 'show']); // ❌ MANQUANTE
    Route::put('/formations/{id}', [FormationController::class, 'update']); // ❌ MANQUANTE
    Route::delete('/formations/{id}', [FormationController::class, 'destroy']); // ❌ MANQUANTE
    
    // Formations suivies par l'utilisateur
    Route::get('/my-formations', [FormationController::class, 'myFormations']); // ❌ MANQUANTE
    
    // Inscription/désinscription
    Route::post('/formations/{id}/enroll', [FormationController::class, 'enroll']); // ❌ MANQUANTE
    Route::delete('/formations/{id}/unenroll', [FormationController::class, 'unenroll']); // ❌ MANQUANTE
    
    // Statistiques
    Route::get('/formations/{id}/stats', [FormationController::class, 'stats']); // ❌ MANQUANTE
    Route::get('/formations/stats', [FormationController::class, 'globalStats']); // ❌ MANQUANTE
});
```

### 3. 🏷️ ROUTES CATÉGORIES (useCategories.js)
```php
Route::middleware('auth:api')->group(function () {
    // CRUD catégories
    Route::get('/categories', [CategoryController::class, 'index']); // ❌ MANQUANTE
    Route::post('/categories', [CategoryController::class, 'store']); // ❌ MANQUANTE
    Route::get('/categories/{id}', [CategoryController::class, 'show']); // ❌ MANQUANTE
    Route::put('/categories/{id}', [CategoryController::class, 'update']); // ❌ MANQUANTE
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']); // ❌ MANQUANTE
    
    // Catégories avec formations/cours
    Route::get('/categories/{id}/formations', [CategoryController::class, 'formations']); // ❌ MANQUANTE
    Route::get('/categories/{id}/courses', [CategoryController::class, 'courses']); // ❌ MANQUANTE
});
```

### 4. 📖 ROUTES CHAPITRES (useChapters.js)
```php
Route::middleware('auth:api')->group(function () {
    // CRUD chapitres
    Route::get('/courses/{course_id}/chapters', [ChapterController::class, 'index']); // ❌ MANQUANTE
    Route::post('/courses/{course_id}/chapters', [ChapterController::class, 'store']); // ❌ MANQUANTE
    Route::get('/chapters/{id}', [ChapterController::class, 'show']); // ❌ MANQUANTE
    Route::put('/chapters/{id}', [ChapterController::class, 'update']); // ❌ MANQUANTE
    Route::delete('/chapters/{id}', [ChapterController::class, 'destroy']); // ❌ MANQUANTE
    
    // Réorganiser chapitres
    Route::put('/courses/{course_id}/chapters/reorder', [ChapterController::class, 'reorder']); // ❌ MANQUANTE
    
    // Progression chapitres
    Route::put('/chapters/{id}/progress', [ChapterController::class, 'updateProgress']); // ❌ MANQUANTE
    Route::post('/chapters/{id}/complete', [ChapterController::class, 'markComplete']); // ❌ MANQUANTE
});
```

### 5. 📊 ROUTES PROGRESSION (useProgress.js)
```php
Route::middleware('auth:api')->group(function () {
    // Progression utilisateur
    Route::get('/my-progress', [ProgressController::class, 'myProgress']); // ❌ MANQUANTE
    Route::get('/formations/{id}/progress', [ProgressController::class, 'formationProgress']); // ❌ MANQUANTE
    Route::get('/courses/{id}/progress', [ProgressController::class, 'courseProgress']); // ❌ MANQUANTE
    
    // Mettre à jour progression
    Route::put('/chapters/{id}/progress', [ProgressController::class, 'updateChapterProgress']); // ❌ MANQUANTE
    Route::put('/courses/{id}/progress', [ProgressController::class, 'updateCourseProgress']); // ❌ MANQUANTE
    
    // Statistiques progression (admin/formateur)
    Route::get('/users/{id}/progress', [ProgressController::class, 'userProgress']); // ❌ MANQUANTE
    Route::get('/progress/stats', [ProgressController::class, 'stats']); // ❌ MANQUANTE
});
```

### 6. 📝 ROUTES INSCRIPTIONS (useEnrollment.js)
```php
Route::middleware('auth:api')->group(function () {
    // Mes inscriptions
    Route::get('/my-enrollments', [EnrollmentController::class, 'myEnrollments']); // ❌ MANQUANTE
    
    // Gestion inscriptions (admin)
    Route::get('/enrollments', [EnrollmentController::class, 'index']); // ❌ MANQUANTE
    Route::post('/enrollments', [EnrollmentController::class, 'store']); // ❌ MANQUANTE
    Route::delete('/enrollments/{id}', [EnrollmentController::class, 'destroy']); // ❌ MANQUANTE
    
    // Inscriptions d'une formation/cours
    Route::get('/formations/{id}/enrollments', [EnrollmentController::class, 'formationEnrollments']); // ❌ MANQUANTE
    Route::get('/courses/{id}/enrollments', [EnrollmentController::class, 'courseEnrollments']); // ❌ MANQUANTE
    
    // Statistiques inscriptions
    Route::get('/enrollments/stats', [EnrollmentController::class, 'stats']); // ❌ MANQUANTE
});
```

### 7. 💬 ROUTES TEACHER FEEDBACKS (useTeacherFeedbacks.js)
```php
Route::middleware('auth:api')->group(function () {
    // CRUD feedbacks formateurs
    Route::get('/my-teacher-feedbacks', [TeacherFeedbackController::class, 'index']); // ❌ MANQUANTE
    Route::post('/teacher-feedbacks', [TeacherFeedbackController::class, 'store']); // ❌ MANQUANTE
    Route::get('/teacher-feedbacks/{id}', [TeacherFeedbackController::class, 'show']); // ❌ MANQUANTE
    Route::put('/teacher-feedbacks/{id}', [TeacherFeedbackController::class, 'update']); // ❌ MANQUANTE
    Route::delete('/teacher-feedbacks/{id}', [TeacherFeedbackController::class, 'destroy']); // ❌ MANQUANTE
    
    // Feedbacks d'un étudiant
    Route::get('/students/{id}/feedbacks', [TeacherFeedbackController::class, 'studentFeedbacks']); // ❌ MANQUANTE
    
    // Marquer comme lu
    Route::patch('/teacher-feedbacks/{id}/read', [TeacherFeedbackController::class, 'markAsRead']); // ❌ MANQUANTE
    
    // Statistiques et envoi en masse
    Route::get('/teacher-feedbacks/stats', [TeacherFeedbackController::class, 'stats']); // ❌ MANQUANTE
    Route::post('/teacher-feedbacks/bulk', [TeacherFeedbackController::class, 'sendBulk']); // ❌ MANQUANTE
});
```

### 8. ⭐ ROUTES STUDENT FEEDBACKS (useStudentFeedbacks.js)
```php
Route::middleware('auth:api')->group(function () {
    // CRUD feedbacks étudiants
    Route::get('/my-student-feedbacks', [StudentFeedbackController::class, 'index']); // ❌ MANQUANTE
    Route::post('/student-feedbacks', [StudentFeedbackController::class, 'store']); // ❌ MANQUANTE
    Route::get('/student-feedbacks/{id}', [StudentFeedbackController::class, 'show']); // ❌ MANQUANTE
    Route::put('/student-feedbacks/{id}', [StudentFeedbackController::class, 'update']); // ❌ MANQUANTE
    Route::delete('/student-feedbacks/{id}', [StudentFeedbackController::class, 'destroy']); // ❌ MANQUANTE
    
    // Feedbacks d'un cours/formateur
    Route::get('/courses/{id}/feedbacks', [StudentFeedbackController::class, 'courseFeedbacks']); // ❌ MANQUANTE
    Route::get('/teachers/{id}/feedbacks', [StudentFeedbackController::class, 'teacherFeedbacks']); // ❌ MANQUANTE
    Route::get('/courses/{id}/my-feedback', [StudentFeedbackController::class, 'myFeedbackForCourse']); // ❌ MANQUANTE
    
    // Modération et statistiques
    Route::patch('/student-feedbacks/{id}/moderate', [StudentFeedbackController::class, 'moderate']); // ❌ MANQUANTE
    Route::get('/student-feedbacks/stats', [StudentFeedbackController::class, 'stats']); // ❌ MANQUANTE
});
```

### 9. 🏆 ROUTES CERTIFICATS (useCertificates.js)
```php
Route::middleware('auth:api')->group(function () {
    // Mes certificats
    Route::get('/my-course-certificates', [CertificateController::class, 'myCertificatesCourse']); // ❌ MANQUANTE
    Route::get('/my-formation-certificates', [CertificateController::class, 'myCertificatesFormation']); // ❌ MANQUANTE
    
    // Certificats d'un utilisateur (admin)
    Route::get('/users/{id}/course-certificates', [CertificateController::class, 'userCourseCertificates']); // ❌ MANQUANTE
    Route::get('/users/{id}/formation-certificates', [CertificateController::class, 'userFormationCertificates']); // ❌ MANQUANTE
    
    // Générer certificats
    Route::post('/course-certificates', [CertificateController::class, 'generateCourseCertificate']); // ❌ MANQUANTE
    Route::post('/formation-certificates', [CertificateController::class, 'generateFormationCertificate']); // ❌ MANQUANTE
    
    // Téléchargement et vérification
    Route::get('/course-certificates/{id}/download', [CertificateController::class, 'downloadCourseCertificate']); // ❌ MANQUANTE
    Route::get('/formation-certificates/{id}/download', [CertificateController::class, 'downloadFormationCertificate']); // ❌ MANQUANTE
    Route::get('/certificates/verify/{code}', [CertificateController::class, 'verifyCertificate']); // ❌ MANQUANTE
    
    // Gestion certificats (admin)
    Route::patch('/course-certificates/{id}/invalidate', [CertificateController::class, 'invalidateCourseCertificate']); // ❌ MANQUANTE
    Route::patch('/formation-certificates/{id}/invalidate', [CertificateController::class, 'invalidateFormationCertificate']); // ❌ MANQUANTE
    Route::post('/course-certificates/{id}/regenerate', [CertificateController::class, 'regenerateCourseCertificate']); // ❌ MANQUANTE
    Route::post('/formation-certificates/{id}/regenerate', [CertificateController::class, 'regenerateFormationCertificate']); // ❌ MANQUANTE
    
    // Statistiques
    Route::get('/certificates/stats', [CertificateController::class, 'stats']); // ❌ MANQUANTE
});
```

---

## 📝 RÉSUMÉ
- **✅ Routes existantes** : ~15 routes
- **❌ Routes manquantes** : ~60 routes  
- **🚨 Priorité** : Créer les contrôleurs manquants et ajouter ces routes dans `routes/api.php`

## 🎯 ÉTAPES SUIVANTES
1. Créer les contrôleurs manquants
2. Ajouter les routes dans `routes/api.php`
3. Tester les hooks avec les vraies routes API
4. Vérifier l'alignement avec les champs de base de données
