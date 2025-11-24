<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Criteria;
use App\Models\Rank;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (Rank::all() as $rank) {
            foreach (Category::all() as $category) {
                Criteria::factory()
                    ->count(5)
                    ->create([
                        'rank_id' => $rank->id,
                        'category_id' => $category->id,
                    ]);
            }
        }
    }
}
