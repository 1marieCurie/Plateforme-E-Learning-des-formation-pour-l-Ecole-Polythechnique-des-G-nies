<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TABLES DE LA BASE DE DONNÉES ===\n\n";

$tables = DB::select('SHOW TABLES');
foreach ($tables as $table) {
    $tableName = array_values((array) $table)[0];
    echo "- $tableName\n";
}
