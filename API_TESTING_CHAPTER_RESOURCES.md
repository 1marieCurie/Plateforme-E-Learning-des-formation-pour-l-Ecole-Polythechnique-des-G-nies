# Test des API de Ressources de Chapitre

## Prérequis
- Avoir un utilisateur formateur et un étudiant dans la base de données
- Avoir une formation, un cours, et un chapitre créés
- Token JWT pour l'authentification

## Exemples de requêtes

### 1. Créer une ressource PDF (Formateur)

```bash
curl -X POST http://localhost:8000/api/chapters/1/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Document PDF Important" \
  -F "description=Ce document contient des informations essentielles" \
  -F "file_type=pdf" \
  -F "file=@/path/to/your/document.pdf" \
  -F "is_downloadable=true" \
  -F "is_required=true" \
  -F "access_level=enrolled"
```

### 2. Créer une ressource lien (Formateur)

```bash
curl -X POST http://localhost:8000/api/chapters/1/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vidéo YouTube",
    "description": "Vidéo explicative du chapitre",
    "file_type": "link",
    "link_url": "https://www.youtube.com/watch?v=example",
    "is_downloadable": false,
    "access_level": "free"
  }'
```

### 3. Lister toutes les ressources d'un chapitre

```bash
curl -X GET http://localhost:8000/api/chapters/1/resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Filtrer les ressources par type

```bash
curl -X GET "http://localhost:8000/api/chapters/1/resources?type=pdf&downloadable_only=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Voir une ressource spécifique

```bash
curl -X GET http://localhost:8000/api/chapters/1/resources/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Télécharger une ressource

```bash
curl -X GET http://localhost:8000/api/chapters/1/resources/1/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -O -J
```

### 7. Mettre à jour une ressource (Formateur)

```bash
curl -X PUT http://localhost:8000/api/chapters/1/resources/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nouveau titre",
    "description": "Nouvelle description",
    "is_downloadable": false,
    "access_level": "premium"
  }'
```

### 8. Réorganiser les ressources (Formateur)

```bash
curl -X PUT http://localhost:8000/api/chapters/1/resources/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resources": [
      {"id": 2, "order_index": 1},
      {"id": 1, "order_index": 2},
      {"id": 3, "order_index": 3}
    ]
  }'
```

### 9. Voir les statistiques des ressources (Formateur)

```bash
curl -X GET http://localhost:8000/api/chapters/1/resources/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Supprimer une ressource (Formateur)

```bash
curl -X DELETE http://localhost:8000/api/chapters/1/resources/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Test avec Postman

### Collection Postman

1. **Variables d'environnement :**
   - `base_url` : http://localhost:8000/api
   - `jwt_token` : Votre token JWT après connexion
   - `chapter_id` : ID du chapitre de test

2. **Authentification :**
   - Type: Bearer Token
   - Token: {{jwt_token}}

### Réponses attendues

#### Succès - Création de ressource
```json
{
  "message": "Ressource créée avec succès",
  "resource": {
    "id": 1,
    "title": "Document PDF Important",
    "description": "Ce document contient des informations essentielles",
    "file_type": "pdf",
    "file_path": "chapter-resources/1640995200_document-pdf-important.pdf",
    "original_filename": "document.pdf",
    "is_downloadable": true,
    "is_required": true,
    "access_level": "enrolled",
    "order_index": 1,
    "created_at": "2024-01-01T12:00:00.000000Z"
  }
}
```

#### Succès - Liste des ressources
```json
{
  "chapter": {
    "id": 1,
    "titre": "Introduction au JavaScript",
    "description": "Premier chapitre du cours"
  },
  "resources": [
    {
      "id": 1,
      "title": "Document PDF Important",
      "description": "Document essentiel",
      "file_type": "pdf",
      "file_icon": "file-pdf",
      "formatted_file_size": "1.5 MB",
      "is_downloadable": true,
      "is_required": true,
      "access_level": "enrolled",
      "download_count": 5,
      "view_count": 12,
      "file_url": "http://localhost:8000/storage/chapter-resources/document.pdf",
      "created_at": "2024-01-01T12:00:00.000000Z"
    }
  ]
}
```

#### Erreur - Accès non autorisé
```json
{
  "error": "Accès non autorisé"
}
```

#### Erreur - Validation
```json
{
  "errors": {
    "title": ["Le champ title est obligatoire."],
    "file": ["Le champ file est obligatoire."]
  }
}
```

## Scénarios de test

### Scénario 1: Formateur crée et gère des ressources
1. Connexion en tant que formateur
2. Création d'une ressource PDF
3. Création d'un lien YouTube
4. Visualisation de la liste des ressources
5. Réorganisation des ressources
6. Mise à jour d'une ressource
7. Consultation des statistiques

### Scénario 2: Étudiant consulte les ressources
1. Connexion en tant qu'étudiant inscrit
2. Visualisation des ressources accessibles
3. Téléchargement d'une ressource autorisée
4. Tentative d'accès à une ressource premium (échec attendu)

### Scénario 3: Gestion des permissions
1. Étudiant non inscrit tente d'accéder aux ressources (échec)
2. Étudiant tente de créer une ressource (échec)
3. Formateur accède aux statistiques (succès)

## Données de test suggérées

### Utilisateurs
- Formateur: formateur@test.com / password
- Étudiant: etudiant@test.com / password
- Admin: admin@test.com / password

### Formation/Cours/Chapitre
- Formation: "Développement Web"
- Cours: "JavaScript Fondamentaux"
- Chapitre: "Introduction à JavaScript"

### Types de fichiers à tester
- PDF: document.pdf
- Vidéo: video.mp4
- Image: image.jpg
- Archive: archive.zip
- Lien: https://example.com
