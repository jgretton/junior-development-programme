<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Enums\Status;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => (static::$password ??= Hash::make('password')),
            'remember_token' => Str::random(10),
            'status' => Status::PENDING,
            'guardian_email' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(
            fn(array $attributes) => [
                'email_verified_at' => null,
            ],
        );
    }

    /**
     * Role Functions
     */
    public function admin()
    {
        return $this->state([
            'role' => Role::ADMIN,
        ]);
    }
    public function coach()
    {
        return $this->state([
            'role' => Role::JUNIOR_DEVELOPMENT_COACH,
        ]);
    }
    public function observer()
    {
        return $this->state([
            'role' => Role::OBSERVER,
        ]);
    }
    public function playerWithGuardian()
    {
        return $this->state([
            'role' => Role::PLAYER,
            'guardian_email' => fake()->safeEmail(),
        ]);
    }
    public function player()
    {
        return $this->state([
            'role' => Role::PLAYER,
        ]);
    }

    /**
     * Status functions
     */
    public function active()
    {
        return $this->state([
            'status' => Status::ACTIVE,
        ]);
    }
    public function inactive()
    {
        return $this->state([
            'status' => Status::INACTIVE,
        ]);
    }
    public function archived()
    {
        return $this->state([
            'status' => Status::ARCHIVED,
        ]);
    }
}
