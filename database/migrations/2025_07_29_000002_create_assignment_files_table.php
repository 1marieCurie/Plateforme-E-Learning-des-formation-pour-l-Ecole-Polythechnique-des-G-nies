<?php
// Créez une migration : php artisan make:migration create_assignment_files_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('assignment_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type');
            $table->bigInteger('file_size');
            $table->string('file_description')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('assignment_files');
    }
};
