<?php

// Vérifier la structure de la table users
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=plateforme_formation', 'epg_ecole', 'EPG2025plateforme&');
    
    echo "=== STRUCTURE DE LA TABLE USERS ===\n";
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']}) - {$column['Null']}\n";
    }
    
    echo "\n=== QUELQUES UTILISATEURS ===\n";
    $stmt = $pdo->query("SELECT * FROM users WHERE role = 'formateur' LIMIT 3");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $user) {
        echo "ID: {$user['id']}\n";
        foreach ($user as $key => $value) {
            echo "  $key: $value\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}
