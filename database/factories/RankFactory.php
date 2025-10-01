<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class RankFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [];
    }
    public function bronze()
    {
        return $this->state([
            'name' => 'Bronze',
            'level' => 1,
        ]);
    }
    public function silver()
    {
        return $this->state([
            'name' => 'Silver',
            'level' => 2,
        ]);
    }
    public function gold()
    {
        return $this->state([
            'name' => 'Gold',
            'level' => 3,
        ]);
    }
    public function platinum()
    {
        return $this->state([
            'name' => 'Platinum',
            'level' => 4,
        ]);
    }
}
