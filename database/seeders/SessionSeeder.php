<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\Status;
use App\Models\Criteria;
use App\Models\PlayerProgress;
use App\Models\Session;
use App\Models\User;
use App\Services\PlayerProgressSummaryService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable observer during seeding for performance
        PlayerProgress::unsetEventDispatcher();

        // Get all active players
        $activePlayers = User::where('role', Role::PLAYER)
            ->where('status', Status::ACTIVE)
            ->get();

        // Get admin and coach for assessments
        $admin = User::where('role', Role::ADMIN)->first();
        $coach = User::where('role', Role::JUNIOR_DEVELOPMENT_COACH)
            ->where('status', Status::ACTIVE)
            ->first();

        if (!$admin || !$coach) {
            throw new \Exception('Admin and Coach users must exist before running SessionSeeder');
        }

        // Get criteria by ranks
        $bronzeCriteria = Criteria::whereHas('rank', fn($q) => $q->where('name', 'Bronze'))->get();
        $silverCriteria = Criteria::whereHas('rank', fn($q) => $q->where('name', 'Silver'))->get();
        $goldCriteria = Criteria::whereHas('rank', fn($q) => $q->where('name', 'Gold'))->get();

        if ($bronzeCriteria->count() < 4 || $silverCriteria->count() < 4) {
            throw new \Exception('Need at least 4 Bronze and 4 Silver criteria');
        }

        // Track which criteria each player has completed (user_id => [criteria_ids])
        $playerCompletedCriteria = [];

        // Categorize players into progression groups
        $playerGroups = $this->categorizePlayersByProgression($activePlayers);

        // Create 24 completed sessions (assessed by admin)
        for ($i = 1; $i <= 24; $i++) {
            $this->createProgressionSession(
                $i, 
                $admin, 
                $activePlayers, 
                $bronzeCriteria, 
                $silverCriteria, 
                $goldCriteria,
                $playerCompletedCriteria, 
                $playerGroups,
                true
            );
        }

        // Create 1 pending session (assessed by coach)
        $this->createProgressionSession(
            25,
            $coach,
            $activePlayers,
            $bronzeCriteria,
            $silverCriteria,
            $goldCriteria,
            $playerCompletedCriteria,
            $playerGroups,
            false
        );

        // Rebuild player progress summaries after all progress has been seeded
        $this->command->info('Rebuilding player progress summaries...');
        $summaryService = app(PlayerProgressSummaryService::class);
        $summaryService->rebuildAll();
        $this->command->info('Player progress summaries rebuilt!');
    }

    private function categorizePlayersByProgression($players)
    {
        $shuffled = $players->shuffle();
        $total = $shuffled->count();
        
        return [
            'beginners' => $shuffled->take(ceil($total * 0.3)), // 30% - focus on Bronze
            'intermediate' => $shuffled->skip(ceil($total * 0.3))->take(ceil($total * 0.4)), // 40% - Bronze to Silver
            'advanced' => $shuffled->skip(ceil($total * 0.7)), // 30% - complete Bronze, progress Silver
        ];
    }

    private function createProgressionSession(
        int $sessionNumber,
        User $assessor,
        $activePlayers,
        $bronzeCriteria,
        $silverCriteria,
        $goldCriteria,
        array &$playerCompletedCriteria,
        array $playerGroups,
        bool $isCompleted
    ): void {
        // Create session with a date in the past, spaced weekly
        $sessionDate = now()->subDays(200 - ($sessionNumber * 7))->format('Y-m-d');
        
        $session = Session::factory()->create([
            'date' => $sessionDate,
            'name' => "Training Session #{$sessionNumber}",
            'created_by' => $assessor->id
        ]);

        // Strategic session focus based on session number
        $focusCriteria = $this->selectSessionFocus($sessionNumber, $bronzeCriteria, $silverCriteria, $goldCriteria);
        $session->criteria()->attach($focusCriteria->pluck('id'));

        // Select ~30 players as attendees with some variation
        $attendeeCount = rand(25, 35);
        $attendeeCount = min($attendeeCount, $activePlayers->count());
        $attendees = $activePlayers->random($attendeeCount);

        // Add attendees to session_attendance
        $attendanceData = [];
        foreach ($attendees as $player) {
            $attendanceData[] = [
                'session_id' => $session->id,
                'player_id' => $player->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('session_attendance')->insert($attendanceData);

        // Create player progress based on their group and session focus
        foreach ($attendees as $player) {
            if (!isset($playerCompletedCriteria[$player->id])) {
                $playerCompletedCriteria[$player->id] = [];
            }

            $this->createProgressionBasedProgress(
                $player,
                $session,
                $focusCriteria,
                $bronzeCriteria,
                $silverCriteria,
                $playerGroups,
                $playerCompletedCriteria,
                $assessor,
                $sessionDate,
                $isCompleted,
                $sessionNumber
            );
        }
    }

    private function selectSessionFocus($sessionNumber, $bronzeCriteria, $silverCriteria, $goldCriteria)
    {
        // Sessions 1-10: Primarily Bronze focus
        if ($sessionNumber <= 10) {
            return $bronzeCriteria->random(4);
        }
        // Sessions 11-18: Mixed Bronze/Silver focus
        elseif ($sessionNumber <= 18) {
            $bronze = $bronzeCriteria->random(2);
            $silver = $silverCriteria->random(2);
            return $bronze->merge($silver);
        }
        // Sessions 19-25: Primarily Silver focus with some Gold
        else {
            $silver = $silverCriteria->random(3);
            $gold = $goldCriteria->random(1);
            return $silver->merge($gold);
        }
    }

    private function createProgressionBasedProgress(
        $player,
        $session,
        $focusCriteria,
        $bronzeCriteria,
        $silverCriteria,
        $playerGroups,
        array &$playerCompletedCriteria,
        $assessor,
        $sessionDate,
        $isCompleted,
        $sessionNumber
    ): void {
        // Determine player group
        $playerGroup = 'intermediate'; // default
        if ($playerGroups['beginners']->contains($player)) {
            $playerGroup = 'beginners';
        } elseif ($playerGroups['advanced']->contains($player)) {
            $playerGroup = 'advanced';
        }

        // Adjust participation and completion rates by group
        $participationRate = $this->getParticipationRate($playerGroup, $sessionNumber);
        $completionRate = $this->getCompletionRate($playerGroup, $sessionNumber);

        if (rand(1, 100) > $participationRate) {
            return; // Player doesn't participate this session
        }

        // Focus criteria completion
        $availableFocusCriteria = $focusCriteria->filter(function ($criteria) use ($player, $playerCompletedCriteria) {
            return !in_array($criteria->id, $playerCompletedCriteria[$player->id]);
        });

        if ($availableFocusCriteria->count() > 0) {
            $numToComplete = max(1, ceil($availableFocusCriteria->count() * ($completionRate / 100)));
            $completedFocusCriteria = $availableFocusCriteria->random(min($numToComplete, $availableFocusCriteria->count()));

            foreach ($completedFocusCriteria as $criteria) {
                $this->createPlayerProgress(
                    $player,
                    $criteria,
                    $session,
                    $assessor,
                    $sessionDate,
                    $isCompleted,
                    false
                );
                $playerCompletedCriteria[$player->id][] = $criteria->id;
            }
        }

        // Non-focus criteria - strategic progression
        $this->addNonFocusProgression(
            $player,
            $session,
            $focusCriteria,
            $bronzeCriteria,
            $silverCriteria,
            $playerGroup,
            $playerCompletedCriteria,
            $assessor,
            $sessionDate,
            $isCompleted,
            $sessionNumber
        );
    }

    private function getParticipationRate($playerGroup, $sessionNumber)
    {
        $baseRates = [
            'beginners' => 75,
            'intermediate' => 85,
            'advanced' => 90
        ];
        
        // Increase participation over time
        $timeBonus = min(15, floor($sessionNumber / 3));
        
        return min(95, $baseRates[$playerGroup] + $timeBonus);
    }

    private function getCompletionRate($playerGroup, $sessionNumber)
    {
        $baseRates = [
            'beginners' => 50,
            'intermediate' => 70,
            'advanced' => 85
        ];
        
        // Increase completion over time
        $timeBonus = min(20, floor($sessionNumber / 2));
        
        return min(95, $baseRates[$playerGroup] + $timeBonus);
    }

    private function addNonFocusProgression(
        $player,
        $session,
        $focusCriteria,
        $bronzeCriteria,
        $silverCriteria,
        $playerGroup,
        array &$playerCompletedCriteria,
        $assessor,
        $sessionDate,
        $isCompleted,
        $sessionNumber
    ): void {
        // Advanced players get more non-focus achievements
        $nonFocusChance = [
            'beginners' => 20,
            'intermediate' => 35,
            'advanced' => 50
        ][$playerGroup];

        if (rand(1, 100) > $nonFocusChance) {
            return;
        }

        // Strategic selection based on player's current progress
        $completedBronze = collect($playerCompletedCriteria[$player->id] ?? [])
            ->intersect($bronzeCriteria->pluck('id'))
            ->count();
        
        $allCriteria = $bronzeCriteria->merge($silverCriteria);
        
        // If player hasn't completed much Bronze, focus on Bronze
        if ($completedBronze < 20) {
            $availableNonFocus = $bronzeCriteria->filter(function ($criteria) use ($player, $playerCompletedCriteria, $focusCriteria) {
                return !in_array($criteria->id, $playerCompletedCriteria[$player->id]) && 
                       !$focusCriteria->contains($criteria);
            });
        } else {
            // Focus on Silver for more advanced progress
            $availableNonFocus = $silverCriteria->filter(function ($criteria) use ($player, $playerCompletedCriteria, $focusCriteria) {
                return !in_array($criteria->id, $playerCompletedCriteria[$player->id]) && 
                       !$focusCriteria->contains($criteria);
            });
        }

        if ($availableNonFocus->count() > 0) {
            $numNonFocus = rand(1, 2);
            $nonFocusCriteria = $availableNonFocus->random(min($numNonFocus, $availableNonFocus->count()));

            foreach ($nonFocusCriteria as $criteria) {
                $this->createPlayerProgress(
                    $player,
                    $criteria,
                    $session,
                    $assessor,
                    $sessionDate,
                    $isCompleted,
                    true
                );
                $playerCompletedCriteria[$player->id][] = $criteria->id;
            }
        }
    }

    private function createPlayerProgress(
        User $player,
        $criteria,
        Session $session,
        User $assessor,
        string $sessionDate,
        bool $isCompleted,
        bool $isNonFocus
    ): void {
        $admin = User::where('role', Role::ADMIN)->first();

        PlayerProgress::create([
            'user_id' => $player->id,
            'criteria_id' => $criteria->id,
            'session_id' => $session->id,
            'status' => $isCompleted ? 'COMPLETED' : 'PENDING',
            'assessed_by' => $assessor->id,
            'approved_by' => $isCompleted ? $admin->id : null,
            'assessed_at' => $sessionDate,
            'approved_at' => $isCompleted ? now() : null,
            'non_focus_criteria' => $isNonFocus,
        ]);
    }
}
