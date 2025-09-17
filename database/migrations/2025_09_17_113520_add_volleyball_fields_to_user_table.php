<?php

use App\Enums\Role;
use App\Enums\Status;
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
        Schema::table('users', function (Blueprint $table) {
            /** 
             * Guardian email
             * role
             * status
             * last logged in
             */
            $table->string('guardian_email')->nullable();
            $table->enum('role', Role::cases());
            $table->enum('status', Status::cases());
            $table->timestamp('last_login_at')->nullable();            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['guardian_email','role', 'status','last_login_at']);
        });
    }
};
