<?php

namespace Database\Seeders;

use App\Models\Criteria;
use App\Models\Session;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Session::factory()
            ->count(5)
            ->create()
            ->each(function ($session) {
                // Attach 3-7 random criteria to each session
                $criteriaIds = Criteria::inRandomOrder()->limit(rand(3, 7))->pluck('id');
                $session->criteria()->attach($criteriaIds);
            });
    }
}
