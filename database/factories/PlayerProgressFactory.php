<?php

namespace Database\Factories;

use App\Models\Criteria;
use App\Models\PlayerProgress;
use App\Models\Session;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PlayerProgress>
 */
class PlayerProgressFactory extends Factory
{
    protected $model = PlayerProgress::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $assessedAt = fake()->dateTimeBetween('-1 month', 'now');
        $isCompleted = fake()->boolean(70); // 70% chance of being completed

        return [
            'user_id' => User::factory(),
            'criteria_id' => Criteria::factory(),
            'session_id' => Session::factory(),
            'status' => $isCompleted ? 'COMPLETED' : 'PENDING',
            'assessed_by' => User::factory(),
            'approved_by' => $isCompleted ? User::factory() : null,
            'assessed_at' => $assessedAt,
            'approved_at' => $isCompleted ? fake()->dateTimeBetween($assessedAt, 'now') : null,
            'non_focus_criteria' => false,
        ];
    }

    /**
     * Indicate that the progress is pending approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'PENDING',
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate that the progress is completed.
     */
    public function completed(): static
    {
        return $this->state(function (array $attributes) {
            $assessedAt = $attributes['assessed_at'] ?? now();

            return [
                'status' => 'COMPLETED',
                'approved_by' => User::factory(),
                'approved_at' => fake()->dateTimeBetween($assessedAt, 'now'),
            ];
        });
    }

    /**
     * Indicate that this is a non-focus criteria achievement.
     */
    public function nonFocus(): static
    {
        return $this->state(fn (array $attributes) => [
            'non_focus_criteria' => true,
        ]);
    }

    /**
     * Set the assessed date to match a specific date.
     */
    public function assessedOn($date): static
    {
        return $this->state(fn (array $attributes) => [
            'assessed_at' => $date,
        ]);
    }
}
