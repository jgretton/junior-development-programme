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
        Schema::create('player_progress_summary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->foreignId('current_rank_id')->nullable()->constrained('ranks')->onDelete('set null');
            $table->decimal('overall_percentage', 5, 2)->default(0);
            $table->integer('overall_completed')->default(0);
            $table->integer('overall_total')->default(0);
            $table->json('rank_progress')->nullable();
            $table->json('category_progress')->nullable();
            $table->timestamps();

            // Indexes for filtering and sorting
            $table->index('current_rank_id');
            $table->index('overall_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_progress_summary');
    }
};
