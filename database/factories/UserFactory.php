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
            'status' => Status::ACTIVE,
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
            'email' => 'admin@test.com',
            'role' => Role::ADMIN,
        ]);
    }
    public function coach()
    {
        return $this->state([
            'email' => 'coach@test.com',
            'role' => Role::JUNIOR_DEVELOPMENT_COACH,
        ]);
    }
    public function observer()
    {
        return $this->state([
            'email' => 'observer@test.com',
            'role' => Role::OBSERVER,
        ]);
    }
    public function playerWithGuardian()
    {
        return $this->state([
            'email' => 'playerWithGuardian@test.com',
            'role' => Role::PLAYER,
            'guardian_email' => 'guardianemail@test.com',
        ]);
    }
    public function player()
    {
        return $this->state([
            'email' => 'player@test.com',
            'role' => Role::PLAYER,
        ]);
    }

    /**
     * Status functions
     */
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
