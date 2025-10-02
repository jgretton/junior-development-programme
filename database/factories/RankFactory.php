<?php

namespace Database\Factories;

use App\Models\Rank;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rank>
 */
class RankFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Rank::class;

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
