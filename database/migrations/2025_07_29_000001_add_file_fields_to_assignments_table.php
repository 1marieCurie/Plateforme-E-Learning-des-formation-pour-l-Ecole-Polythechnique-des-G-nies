<?php
// Créez une nouvelle migration : php artisan make:migration add_file_fields_to_assignments_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('instructions');
            $table->string('file_name')->nullable()->after('file_path');
            $table->string('file_type')->nullable()->after('file_name');
            $table->bigInteger('file_size')->nullable()->after('file_type');
        });
    }

    public function down()
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_name', 'file_type', 'file_size']);
        });
    }
};
