<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
        User::firstOrCreate(['email' => 'admin@test.com'], array_merge(User::factory()->admin()->active()->raw(), ['email' => 'admin@test.com']));
        User::firstOrCreate(['email' => 'coach@test.com'], array_merge(User::factory()->coach()->active()->raw(), ['email' => 'coach@test.com']));
        User::firstOrCreate(
            ['email' => 'observer@test.com'],
            array_merge(User::factory()->observer()->active()->raw(), ['email' => 'observer@test.com']),
        );
        User::firstOrCreate(['email' => 'player@test.com'], array_merge(User::factory()->player()->active()->raw(), ['email' => 'player@test.com']));
        User::firstOrCreate(
            ['email' => 'playerWithGuardian@test.com'],
            array_merge(User::factory()->playerWithGuardian()->active()->raw(), ['email' => 'playerWithGuardian@test.com']),
        );

        /**
         * Status seeder
         */
        User::firstOrCreate(
            ['email' => 'coach-inactive@test.com'],
            array_merge(User::factory()->coach()->inactive()->raw(), ['email' => 'coach-inactive@test.com']),
        );
        User::firstOrCreate(
            ['email' => 'player-inactive@test.com'],
            array_merge(User::factory()->player()->inactive()->raw(), ['email' => 'player-inactive@test.com']),
        );
        User::firstOrCreate(
            ['email' => 'player-archived@test.com'],
            array_merge(User::factory()->player()->archived()->raw(), ['email' => 'player-archived@test.com']),
        );
        User::firstOrCreate(
            ['email' => 'playerWithGuardian-inactive@test.com'],
            array_merge(User::factory()->playerWithGuardian()->inactive()->raw(), ['email' => 'playerWithGuardian-inactive@test.com']),
        );
        User::firstOrCreate(
            ['email' => 'playerWithGuardian-archived@test.com'],
            array_merge(User::factory()->playerWithGuardian()->archived()->raw(), ['email' => 'playerWithGuardian-archived@test.com']),
        );
        User::firstOrCreate(
            ['email' => 'playerpending@test.com'],
            array_merge(User::factory()->player()->raw(), ['email' => 'playerpending@test.com']),
        );

        $this->call(RankSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(CriteriaSeeder::class);
        $this->call(SessionSeeder::class);
    }
}
