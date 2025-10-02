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
        return [
            'name' => 'Development ' . fake()->date('d-m-y'),
            'date' => fake()->date(),
            'focus_areas' => fake()->sentence(rand(8, 20)),
            'created_by' => User::whereIn('role', [Role::ADMIN])->first()->id,
        ];
    }
}
