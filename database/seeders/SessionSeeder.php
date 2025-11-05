<?php

namespace Database\Seeders;

use App\Models\Criteria;
use App\Models\Session;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate 40 sessions across 2024 and 2025, max 4 per month
        $sessions = [];
        $months = [];

        // Create array of all months in 2024 and 2025
        for ($year = 2024; $year <= 2025; $year++) {
            for ($month = 1; $month <= 12; $month++) {
                $months[] = ['year' => $year, 'month' => $month];
            }
        }

        // Shuffle months for random distribution
        shuffle($months);

        // Create 40 sessions distributed across months (max 4 per month)
        foreach ($months as $monthData) {
            $sessionsInMonth = rand(1, 4);

            for ($i = 0; $i < $sessionsInMonth; $i++) {
                if (count($sessions) >= 40) {
                    break 2;
                }

                // Random day in the month
                $daysInMonth = \Carbon\Carbon::create($monthData['year'], $monthData['month'], 1)->daysInMonth;
                $day = rand(1, $daysInMonth);
                $date = sprintf('%d-%02d-%02d', $monthData['year'], $monthData['month'], $day);

                $sessions[] = $date;
            }
        }

        // Sort sessions by date
        sort($sessions);

        // Create sessions with the generated dates
        foreach ($sessions as $date) {
            $session = Session::factory()->create(['date' => $date]);

            // Attach 3-7 random criteria to each session
            $criteriaIds = Criteria::inRandomOrder()->limit(rand(3, 7))->pluck('id');
            $session->criteria()->attach($criteriaIds);
        }
    }
}
