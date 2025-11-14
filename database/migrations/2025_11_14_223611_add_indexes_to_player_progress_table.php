<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('player_progress', function (Blueprint $table) {
            $table->index('status', 'idx_player_progress_status');
            $table->index(['user_id', 'status'], 'idx_player_progress_user_status');
            $table->index(['criteria_id', 'status'], 'idx_player_progress_criteria_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('player_progress', function (Blueprint $table) {
            $table->dropIndex('idx_player_progress_status');
            $table->dropIndex('idx_player_progress_user_status');
            $table->dropIndex('idx_player_progress_criteria_status');
        });
    }
};
