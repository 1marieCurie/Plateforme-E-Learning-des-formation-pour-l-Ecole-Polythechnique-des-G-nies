<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\StudentFeedback;
use Illuminate\Support\Facades\DB;

echo "=== DEBUG StudentFeedback TABLE ===\n";
$model = new StudentFeedback();
echo "Model class: " . get_class($model) . "\n";
echo "Resolved table: " . $model->getTable() . "\n";

// Check existence
$table = $model->getTable();
$exists = DB::select("SHOW TABLES LIKE '$table'");
echo "Table exists? " . (count($exists) ? 'YES' : 'NO') . "\n";

try {
    $count = StudentFeedback::count();
    echo "Count(): $count\n";
} catch (Exception $e) {
    echo "Count() error: " . $e->getMessage() . "\n";
}
