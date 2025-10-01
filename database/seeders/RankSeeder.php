<?php

namespace Database\Seeders;

use App\Models\Rank;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        Rank::factory()->bronze()->create();
        Rank::factory()->silver()->create();
        Rank::factory()->gold()->create();
        Rank::factory()->platinum()->create();
    }
}
