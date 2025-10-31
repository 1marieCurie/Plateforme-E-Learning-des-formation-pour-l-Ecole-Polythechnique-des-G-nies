<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('assignment_grades', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assignment_submission_id');
            $table->float('grade')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->foreign('assignment_submission_id')->references('id')->on('assignment_submissions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('assignment_grades');
    }
};
