<?php

// Vérifier la structure de la table chapters
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=plateforme_formation', 'epg_ecole', 'EPG2025plateforme&');
    
    echo "=== STRUCTURE DE LA TABLE CHAPTERS ===\n";
    $stmt = $pdo->query("DESCRIBE chapters");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']}\n";
    }
    
    echo "\n=== QUELQUES CHAPITRES ===\n";
    $stmt = $pdo->query("SELECT * FROM chapters LIMIT 3");
    $chapters = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($chapters as $chapter) {
        echo "ID: {$chapter['id']}\n";
        foreach ($chapter as $key => $value) {
            echo "  $key: $value\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
