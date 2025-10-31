# 🚀 INVENTAIRE COMPLET DES ROUTES API - PLATEFORME EPG

## 📋 GUIDE COMPLET POUR TESTS POSTMAN

---

## 🔧 **CONFIGURATION POSTMAN**

### Base URL
```
http://localhost:8000/api
```

### Headers requis pour routes authentifiées
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
Accept: application/json
```

---

## 🏗️ **1. UTILITAIRES & CONNEXION DB**

### ✅ Test de connexion DB
```http
GET /check-db-connection
```
**Description :** Vérifie la connexion à la base de données  
**Auth :** Non requis  
**Réponse :** Status de la connexion DB

---

## 🔐 **2. AUTHENTIFICATION**

### 📝 Inscription
```http
POST /register
```
**Body :**
```json
{
    "nom": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "tel": "0612345678",
    "ville": "Casablanca",
    "role": "etudiant"
}
```

### 🔑 Connexion
```http
POST /login
```
**Body :**
```json
{
    "email": "formateur@epg.ma",
    "password": "formateur2025"
}
```
**Réponse :** JWT token à utiliser pour l'authentification

### 👤 Profil utilisateur connecté
```http
GET /me
```
**Auth :** Requis  
**Description :** Récupère les infos de l'utilisateur connecté

### 👋 Déconnexion
```http
POST /logout
```
**Auth :** Requis  
**Description :** Invalide le token JWT

### 📊 Utilisateur authentifié
```http
GET /user
```
**Auth :** Requis  
**Description :** Alternative pour récupérer l'utilisateur connecté

---

## 👨‍🎓 **3. PROFILS ÉTUDIANTS**

### 📋 Liste des profils étudiants
```http
GET /student-profiles
```
**Auth :** Requis

### 👤 Profil étudiant spécifique
```http
GET /student-profiles/{user_id}
```
**Auth :** Requis  
**Exemple :** `/student-profiles/1`

### ➕ Créer un profil étudiant
```http
POST /student-profiles
```
**Auth :** Requis  
**Body :**
```json
{
    "user_id": 1,
    "specialite": "Informatique",
    "niveau_etudes": "Master"
}
```

### ✏️ Modifier un profil étudiant
```http
PUT /student-profiles/{user_id}
```
**Auth :** Requis  
**Body :** Champs à modifier

### 🗑️ Supprimer un profil étudiant
```http
DELETE /student-profiles/{user_id}
```
**Auth :** Requis

---

## 👨‍🏫 **4. PROFILS FORMATEURS**

### 📋 Liste des profils formateurs
```http
GET /teacher-profiles
```
**Auth :** Requis

### 👤 Profil formateur spécifique
```http
GET /teacher-profiles/{user_id}
```
**Auth :** Requis

### ✏️ Modifier un profil formateur
```http
PUT /teacher-profiles/{user_id}
```
**Auth :** Requis  
**Body :**
```json
{
    "specialite": "Développement Web",
    "experience": "10 ans",
    "certifications": "Laravel, AWS"
}
```

### 🗑️ Supprimer un profil formateur
```http
DELETE /teacher-profiles/{user_id}
```
**Auth :** Requis

### ✅ Vérifier un formateur (Admin)
```http
POST /teacher-profiles/{user_id}/verify
```
**Auth :** Requis (Admin)

### 📊 Statistiques formateur
```http
GET /teacher-profiles/stats/{user_id}
```
**Auth :** Requis

---

## 👩‍💼 **5. PROFILS ADMINISTRATEURS**

### 📋 Liste des profils admin
```http
GET /admin-profiles
```
**Auth :** Requis

### 👤 Profil admin spécifique
```http
GET /admin-profiles/{user_id}
```
**Auth :** Requis

### ✏️ Modifier un profil admin
```http
PUT /admin-profiles/{user_id}
```
**Auth :** Requis

### 🗑️ Supprimer un profil admin
```http
DELETE /admin-profiles/{user_id}
```
**Auth :** Requis

---

## 📚 **6. GESTION DES COURS**

### 📖 Cours suivis par l'utilisateur
```http
GET /courses/followed
```
**Auth :** Requis  
**Description :** Cours auxquels l'utilisateur est inscrit

### 🌐 Tous les cours disponibles
```http
GET /courses
```
**Auth :** Requis  
**Description :** Catalogue complet des cours

### ✅ S'inscrire à un cours
```http
POST /courses/{courseId}/enroll
```
**Auth :** Requis  
**Exemple :** `/courses/1/enroll`

### 📈 Mettre à jour la progression
```http
PUT /courses/{courseId}/progress
```
**Auth :** Requis  
**Body :**
```json
{
    "progress_percentage": 75.5,
    "current_chapter": "Chapitre 3"
}
```

### ❌ Se désinscrire d'un cours
```http
DELETE /courses/{courseId}/unenroll
```
**Auth :** Requis

### 📊 Statistiques des cours
```http
GET /courses/stats
```
**Auth :** Requis  
**Description :** Stats personnelles de l'utilisateur

### ➕ Créer un cours (Admin/Formateur)
```http
POST /courses
```
**Auth :** Requis  
**Body :**
```json
{
    "title": "Nouveau Cours",
    "description": "Description du cours",
    "category_id": 1,
    "formation_id": 1,
    "duration_minutes": 120
}
```

### ✏️ Modifier un cours
```http
PUT /courses/{id}
```
**Auth :** Requis

### 🗑️ Supprimer un cours
```http
DELETE /courses/{id}
```
**Auth :** Requis

---

## 📝 **7. GESTION DES DEVOIRS (ASSIGNMENTS)**

### 📋 Liste des devoirs
```http
GET /assignments
```
**Auth :** Requis  
**Description :** Devoirs selon le rôle (étudiant: à faire, formateur: créés)

### ➕ Créer un devoir (Formateur)
```http
POST /assignments
```
**Auth :** Requis  
**Body :**
```json
{
    "title": "TP Laravel",
    "description": "Créer un blog complet",
    "type": "tp",
    "course_id": 1,
    "max_points": 20,
    "due_date": "2025-08-10 23:59:59",
    "is_active": true
}
```

### 📊 Noter un devoir (Formateur/Admin)
```http
PUT /assignments/{id}/grade
```
**Auth :** Requis  
**Body :**
```json
{
    "grade": 18,
    "feedback": "Excellent travail !"
}
```

### 🗑️ Supprimer un devoir
```http
DELETE /assignments/{id}
```
**Auth :** Requis

### 📚 Devoirs d'un cours spécifique
```http
GET /courses/{course_id}/assignments
```
**Auth :** Requis  
**Exemple :** `/courses/1/assignments`

---

## 📤 **8. SOUMISSIONS DE DEVOIRS**

### 📤 Soumettre un devoir (Étudiant)
```http
POST /assignments/{assignment_id}/submit
```
**Auth :** Requis  
**Body :**
```json
{
    "submission_text": "Voici mon travail...",
    "files": ["file1.pdf", "file2.zip"]
}
```

### 📋 Soumissions d'un devoir (Formateur)
```http
GET /assignments/{assignment_id}/submissions
```
**Auth :** Requis  
**Description :** Toutes les soumissions pour ce devoir

### 📊 Noter une soumission (Formateur)
```http
POST /submissions/{submission_id}/grade
```
**Auth :** Requis  
**Body :**
```json
{
    "grade": 16,
    "feedback": "Bon travail, quelques améliorations possibles"
}
```

### 📝 Mes soumissions (Étudiant)
```http
GET /my-submissions
```
**Auth :** Requis  
**Description :** Historique des soumissions de l'étudiant

---

## 📁 **9. RESSOURCES DE CHAPITRES**

### 📋 Ressources d'un chapitre
```http
GET /chapters/{chapter_id}/resources
```
**Auth :** Requis  
**Exemple :** `/chapters/1/resources`

### ➕ Créer une ressource (Formateur)
```http
POST /chapters/{chapter_id}/resources
```
**Auth :** Requis  
**Body :**
```json
{
    "title": "Support de cours",
    "description": "PDF du chapitre",
    "type": "pdf",
    "file_path": "resources/chapter1.pdf"
}
```

### 👁️ Afficher une ressource
```http
GET /chapters/{chapter_id}/resources/{resource_id}
```
**Auth :** Requis

### ⬇️ Télécharger une ressource
```http
GET /chapters/{chapter_id}/resources/{resource_id}/download
```
**Auth :** Requis

### ✏️ Modifier une ressource
```http
PUT /chapters/{chapter_id}/resources/{resource_id}
```
**Auth :** Requis

### 🗑️ Supprimer une ressource
```http
DELETE /chapters/{chapter_id}/resources/{resource_id}
```
**Auth :** Requis

### 🔄 Réorganiser les ressources
```http
PUT /chapters/{chapter_id}/resources/reorder
```
**Auth :** Requis  
**Body :**
```json
{
    "resource_order": [3, 1, 2, 4]
}
```

### 📊 Statistiques des ressources
```http
GET /chapters/{chapter_id}/resources/stats
```
**Auth :** Requis

---

## 🧪 **SCÉNARIOS DE TEST RECOMMANDÉS**

### 🎯 **Scénario 1: Authentification complète**
1. `POST /register` - Créer un compte
2. `POST /login` - Se connecter
3. `GET /me` - Vérifier le profil
4. `POST /logout` - Se déconnecter

### 🎯 **Scénario 2: Parcours Étudiant**
1. `POST /login` avec `etudiant@epg.ma`
2. `GET /courses` - Voir les cours disponibles
3. `POST /courses/1/enroll` - S'inscrire à un cours
4. `GET /courses/followed` - Voir ses cours
5. `GET /courses/1/assignments` - Voir les devoirs
6. `POST /assignments/1/submit` - Soumettre un devoir

### 🎯 **Scénario 3: Parcours Formateur**
1. `POST /login` avec `formateur@epg.ma`
2. `GET /teacher-profiles/stats/1` - Voir ses stats
3. `POST /assignments` - Créer un devoir
4. `GET /assignments/1/submissions` - Voir les soumissions
5. `POST /submissions/1/grade` - Noter une soumission

### 🎯 **Scénario 4: Gestion des ressources**
1. Login formateur
2. `POST /chapters/1/resources` - Ajouter une ressource
3. `GET /chapters/1/resources` - Lister les ressources
4. `GET /chapters/1/resources/1/download` - Télécharger

---

## 📝 **COMPTES DE TEST DISPONIBLES**

### 👨‍🏫 Formateur
```json
{
    "email": "formateur@epg.ma",
    "password": "formateur2025"
}
```

### 👩‍💼 Admin
```json
{
    "email": "admin@epg.ma",
    "password": "admin2025"
}
```

### 👨‍🎓 Étudiant
```json
{
    "email": "etudiant@epg.ma",
    "password": "etudiant2025"
}
```

---

## ⚠️ **NOTES IMPORTANTES**

1. **JWT Token :** Récupérez le token lors du login et utilisez-le dans `Authorization: Bearer {token}`
2. **Content-Type :** Toujours inclure `Content-Type: application/json`
3. **IDs disponibles :** 
   - Formations : 1, 2, 3
   - Cours : 1-6
   - Chapitres : 1-9
   - Utilisateurs : 1-18
4. **Permissions :** Certaines routes nécessitent des rôles spécifiques
5. **Base de données :** Déjà peuplée avec des données de test

---

## 🎉 **TOTAL : 42 ENDPOINTS API DISPONIBLES**

- **Authentification :** 5 endpoints
- **Profils :** 13 endpoints (étudiants, formateurs, admin)
- **Cours :** 9 endpoints 
- **Devoirs :** 6 endpoints
- **Soumissions :** 4 endpoints
- **Ressources :** 8 endpoints
- **Utilitaires :** 2 endpoints

**Votre API est complète et prête pour tous les tests ! 🚀**
