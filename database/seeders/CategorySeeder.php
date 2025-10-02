<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::firstOrCreate(['name' => 'Hitting']);
        Category::firstOrCreate(['name' => 'Blocking']);
        Category::firstOrCreate(['name' => 'Serving']);
        Category::firstOrCreate(['name' => 'Passing']);
        Category::firstOrCreate(['name' => 'Setting']);
    }
}
