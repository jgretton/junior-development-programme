<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database
     */
    public function run(): void
    {
        /**
         * Roles seeder
         */
        User::firstOrCreate(['email' => 'admin@test.com'], User::factory()->admin()->active()->raw());
        User::firstOrCreate(['email' => 'coach@test.com'], User::factory()->coach()->active()->raw());
        User::firstOrCreate(['email' => 'observer@test.com'], User::factory()->observer()->active()->raw());
        User::firstOrCreate(['email' => 'player@test.com'], User::factory()->player()->active()->raw());
        User::firstOrCreate(['email' => 'playerWithGuardian@test.com'], User::factory()->playerWithGuardian()->active()->raw());

        /**
         * Status seeder
         */
        User::factory()
            ->coach()
            ->inactive()
            ->create(['email' => 'coach-inactive@test.com']);
        User::factory()
            ->player()
            ->inactive()
            ->create(['email' => 'player-inactive@test.com']);
        User::factory()
            ->player()
            ->archived()
            ->create(['email' => 'player-archived@test.com']);
        User::factory()
            ->playerWithGuardian()
            ->inactive()
            ->create(['email' => 'playerWithGuardian-inactive@test.com']);
        User::factory()
            ->playerWithGuardian()
            ->archived()
            ->create(['email' => 'playerWithGuardian-archived@test.com']);
        User::factory()
            ->player()
            ->create(['email' => 'playerpending@test.com']);
    }
}
