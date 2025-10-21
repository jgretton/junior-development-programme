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
        Schema::create('player_progress', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('criteria_id')->constrained('criterias');
            $table->enum('status', ['PENDING', 'COMPLETED'])->default('PENDING');
            $table->foreignId('assessed_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->foreignId('session_id')->constrained('training_sessions');
            $table->timestamp('assessed_at');
            $table->timestamp('approved_at')->nullable();

            //this makes sure each player has only one progress per criteria.
            $table->unique(['user_id', 'criteria_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_progress');
    }
};
