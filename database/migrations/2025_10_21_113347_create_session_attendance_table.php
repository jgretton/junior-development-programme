<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('session_attendance', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('session_id')->constrained('training_sessions')->cascadeOnDelete();
            $table->foreignId('player_id')->constrained('users');

            $table->unique(['session_id', 'player_id']);
        });
    }

    /**
     * Reverse the migrations.0
     */
    public function down(): void
    {
        Schema::dropIfExists('session_attendance');
    }
};
