<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Session>
 */
class SessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sessionNames = [
            'Junior Development Session',
            'Skills Training',
            'Team Practice',
            'Advanced Training',
            'Fundamentals Workshop',
            'Technique Session',
        ];

        return [
            'name' => fake()->randomElement($sessionNames),
            'date' => fake()->dateTimeBetween('-2 months', 'now'),
            'focus_areas' => fake()->sentence(rand(8, 20)),
            'created_by' => User::whereIn('role', [Role::ADMIN, Role::JUNIOR_DEVELOPMENT_COACH])
                ->inRandomOrder()
                ->first()?->id ?? User::factory()->coach(),
        ];
    }

    /**
     * Indicate that the session is in the past.
     */
    public function past(): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => fake()->dateTimeBetween('-2 months', '-1 day'),
        ]);
    }

    /**
     * Indicate that the session is upcoming.
     */
    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'date' => fake()->dateTimeBetween('now', '+1 month'),
        ]);
    }
}
