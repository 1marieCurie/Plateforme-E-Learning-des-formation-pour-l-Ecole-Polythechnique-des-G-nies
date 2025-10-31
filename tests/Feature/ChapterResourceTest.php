<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Chapter;
use App\Models\ChapterResource;
use App\Models\Formation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ChapterResourceTest extends TestCase
{
    use RefreshDatabase;

    private $formateur;
    private $etudiant;
    private $course;
    private $chapter;
    private $formation;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer une formation
        $this->formation = Formation::create([
            'nom' => 'Formation Test',
            'description' => 'Description de test',
            'duree_heures' => 40,
            'niveau' => 'débutant',
            'prix' => 299.99,
            'is_active' => true,
        ]);

        // Créer un formateur
        $this->formateur = User::create([
            'nom' => 'Formateur Test',
            'email' => 'formateur@test.com',
            'password' => bcrypt('password'),
            'role' => 'formateur',
        ]);

        // Créer un étudiant
        $this->etudiant = User::create([
            'nom' => 'Etudiant Test',
            'email' => 'etudiant@test.com',
            'password' => bcrypt('password'),
            'role' => 'étudiant',
        ]);

        // Créer un cours
        $this->course = Course::create([
            'titre' => 'Cours Test',
            'description' => 'Description du cours',
            'formation_id' => $this->formation->id,
            'user_id' => $this->formateur->id,
        ]);

        // Créer un chapitre
        $this->chapter = Chapter::create([
            'titre' => 'Chapitre Test',
            'description' => 'Description du chapitre',
            'course_id' => $this->course->id,
        ]);

        // Inscrire l'étudiant à la formation
        $this->etudiant->formations()->attach($this->formation->id);

        Storage::fake('public');
    }

    /** @test */
    public function formateur_peut_creer_ressource_pdf()
    {
        $this->actingAs($this->formateur, 'api');

        Storage::fake('public');
        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');
        
        $response = $this->postJson("/api/chapters/{$this->chapter->id}/resources", [
            'title' => 'Document PDF',
            'description' => 'Un document important',
            'file_type' => 'pdf',
            'file' => $file,
            'is_downloadable' => true,
            'is_required' => true,
            'access_level' => 'enrolled'
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'resource' => [
                'id',
                'title',
                'description',
                'file_type',
                'file_path',
                'original_filename',
                'is_downloadable',
                'is_required',
                'access_level'
            ]
        ]);

        $this->assertDatabaseHas('chapter_resources', [
            'chapter_id' => $this->chapter->id,
            'title' => 'Document PDF',
            'file_type' => 'pdf',
            'is_downloadable' => true,
            'is_required' => true,
            'access_level' => 'enrolled'
        ]);

        // Vérifier qu'un fichier a été stocké
        $resource = ChapterResource::where('chapter_id', $this->chapter->id)->first();
        $this->assertNotNull($resource->file_path);
    }

    /** @test */
    public function formateur_peut_creer_ressource_lien()
    {
        $this->actingAs($this->formateur, 'api');

        $response = $this->postJson("/api/chapters/{$this->chapter->id}/resources", [
            'title' => 'Lien YouTube',
            'description' => 'Vidéo explicative',
            'file_type' => 'link',
            'link_url' => 'https://www.youtube.com/watch?v=example',
            'is_downloadable' => false,
            'access_level' => 'free'
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('chapter_resources', [
            'chapter_id' => $this->chapter->id,
            'title' => 'Lien YouTube',
            'file_type' => 'link',
            'file_path' => 'https://www.youtube.com/watch?v=example',
            'is_downloadable' => false,
            'access_level' => 'free'
        ]);
    }

    /** @test */
    public function etudiant_peut_voir_ressources_accessibles()
    {
        $this->actingAs($this->etudiant, 'api');

        // Créer des ressources avec différents niveaux d'accès
        ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Ressource Gratuite',
            'file_type' => 'pdf',
            'file_path' => 'test.pdf',
            'access_level' => 'free',
            'is_active' => true,
            'order_index' => 1
        ]);

        ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Ressource Inscrit',
            'file_type' => 'pdf',
            'file_path' => 'test2.pdf',
            'access_level' => 'enrolled',
            'is_active' => true,
            'order_index' => 2
        ]);

        ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Ressource Premium',
            'file_type' => 'pdf',
            'file_path' => 'test3.pdf',
            'access_level' => 'premium',
            'is_active' => true,
            'order_index' => 3
        ]);

        $response = $this->getJson("/api/chapters/{$this->chapter->id}/resources");

        $response->assertStatus(200);
        
        $resources = $response->json('resources');
        
        // L'étudiant inscrit devrait voir les ressources free et enrolled, mais pas premium
        $this->assertCount(2, $resources);
        $this->assertEquals('Ressource Gratuite', $resources[0]['title']);
        $this->assertEquals('Ressource Inscrit', $resources[1]['title']);
    }

    /** @test */
    public function etudiant_peut_telecharger_ressource_accessible()
    {
        $this->actingAs($this->etudiant, 'api');

        $resource = ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Document Téléchargeable',
            'file_type' => 'pdf',
            'file_path' => 'chapter-resources/test-document.pdf',
            'original_filename' => 'document.pdf',
            'access_level' => 'enrolled',
            'is_downloadable' => true,
            'is_active' => true,
            'download_count' => 0,
            'order_index' => 1
        ]);

        // Simuler l'existence du fichier
        Storage::disk('public')->put('chapter-resources/test-document.pdf', 'Contenu du PDF');

        $response = $this->getJson("/api/chapters/{$this->chapter->id}/resources/{$resource->id}/download");

        $response->assertStatus(200);

        // Vérifier que le compteur de téléchargement a été incrémenté
        $this->assertDatabaseHas('chapter_resources', [
            'id' => $resource->id,
            'download_count' => 1
        ]);
    }

    /** @test */
    public function etudiant_ne_peut_pas_telecharger_ressource_non_telechargeable()
    {
        $this->actingAs($this->etudiant, 'api');

        $resource = ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Document Non Téléchargeable',
            'file_type' => 'pdf',
            'file_path' => 'chapter-resources/test-document.pdf',
            'access_level' => 'enrolled',
            'is_downloadable' => false,
            'is_active' => true,
            'order_index' => 1
        ]);

        $response = $this->getJson("/api/chapters/{$this->chapter->id}/resources/{$resource->id}/download");

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Cette ressource n\'est pas téléchargeable']);
    }

    /** @test */
    public function formateur_peut_voir_statistiques_ressources()
    {
        $this->actingAs($this->formateur, 'api');

        // Créer plusieurs ressources avec des stats
        ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'PDF 1',
            'file_type' => 'pdf',
            'file_path' => 'test1.pdf',
            'download_count' => 10,
            'view_count' => 25,
            'is_required' => true,
            'order_index' => 1
        ]);

        ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Vidéo 1',
            'file_type' => 'video',
            'file_path' => 'test1.mp4',
            'download_count' => 5,
            'view_count' => 15,
            'is_downloadable' => true,
            'order_index' => 2
        ]);

        $response = $this->getJson("/api/chapters/{$this->chapter->id}/resources/stats");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'chapter' => ['id', 'titre'],
            'stats' => [
                'total_resources',
                'by_type',
                'total_downloads',
                'total_views',
                'required_resources',
                'downloadable_resources',
                'active_resources',
                'most_downloaded',
                'most_viewed'
            ]
        ]);

        $stats = $response->json('stats');
        $this->assertEquals(2, $stats['total_resources']);
        $this->assertEquals(15, $stats['total_downloads']);
        $this->assertEquals(40, $stats['total_views']);
        $this->assertEquals(1, $stats['required_resources']);
        $this->assertEquals(1, $stats['downloadable_resources']);
    }

    /** @test */
    public function formateur_peut_reorganiser_ressources()
    {
        $this->actingAs($this->formateur, 'api');

        $resource1 = ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Ressource 1',
            'file_type' => 'pdf',
            'file_path' => 'test1.pdf',
            'order_index' => 1
        ]);

        $resource2 = ChapterResource::create([
            'chapter_id' => $this->chapter->id,
            'title' => 'Ressource 2',
            'file_type' => 'pdf',
            'file_path' => 'test2.pdf',
            'order_index' => 2
        ]);

        // Inverser l'ordre
        $response = $this->putJson("/api/chapters/{$this->chapter->id}/resources/reorder", [
            'resources' => [
                ['id' => $resource2->id, 'order_index' => 1],
                ['id' => $resource1->id, 'order_index' => 2],
            ]
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('chapter_resources', [
            'id' => $resource1->id,
            'order_index' => 2
        ]);

        $this->assertDatabaseHas('chapter_resources', [
            'id' => $resource2->id,
            'order_index' => 1
        ]);
    }

    /** @test */
    public function etudiant_ne_peut_pas_creer_ressource()
    {
        $this->actingAs($this->etudiant, 'api');

        $response = $this->postJson("/api/chapters/{$this->chapter->id}/resources", [
            'title' => 'Tentative de création',
            'file_type' => 'pdf',
            'file' => UploadedFile::fake()->create('test.pdf')
        ]);

        $response->assertStatus(403);
        $response->assertJson(['error' => 'Accès non autorisé']);
    }
}
