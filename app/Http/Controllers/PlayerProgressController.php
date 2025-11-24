<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Category;
use App\Models\Criteria;
use App\Models\PlayerProgress;
use App\Models\PlayerProgressSummary;
use App\Models\Rank;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerProgressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get all player summaries with user data - SINGLE EFFICIENT QUERY!
        $players = PlayerProgressSummary::with(['user', 'currentRank'])
            ->join('users', 'player_progress_summary.user_id', '=', 'users.id')
            ->where('users.role', Role::PLAYER)
            ->select('player_progress_summary.*')
            ->get()
            ->map(function ($summary) {
                $rankProgress = collect($summary->rank_progress ?? [])
                    ->map(function ($rankData) {
                        return [
                            'rank' => [
                                'name' => $rankData['name'],
                                'level' => $rankData['level'],
                            ],
                            'completed' => $rankData['completed'],
                            'total' => $rankData['total'],
                            'percentage' => $rankData['percentage'],
                        ];
                    })
                    ->values()
                    ->toArray();

                return [
                    'id' => $summary->user_id,
                    'name' => $summary->user->name,
                    'currentRank' => [
                        'name' => $summary->currentRank->name ?? 'Bronze',
                        'level' => $summary->currentRank->level ?? 1,
                    ],
                    'overallProgress' => $summary->overall_percentage,
                    'categoryRanks' => $summary->category_progress ?? [],
                    'progressByRank' => $rankProgress,
                ];
            });

        // Calculate rank distribution
        $rankDistribution = [
            'Bronze' => 0,
            'Silver' => 0,
            'Gold' => 0,
            'Platinum' => 0,
        ];

        $totalRankLevel = 0;
        foreach ($players as $player) {
            if ($player['currentRank']) {
                $rankName = $player['currentRank']['name'];
                if (isset($rankDistribution[$rankName])) {
                    $rankDistribution[$rankName]++;
                }
                $totalRankLevel += $player['currentRank']['level'];
            }
        }

        $averageStarsByRank = [
            'Bronze' => 0,
            'Silver' => 0,
            'Gold' => 0,
            'Platinum' => 0,
        ];

        // Calculate average stars for players working on each rank
        // Only include players whose CURRENT rank matches
        foreach (['Bronze', 'Silver', 'Gold', 'Platinum'] as $rankName) {
            $totalStars = 0;
            $playerCount = 0;

            foreach ($players as $player) {
                // Only include players whose current rank matches this rank
                if ($player['currentRank']['name'] !== $rankName) {
                    continue;
                }

                foreach ($player['progressByRank'] as $rankProgress) {
                    if ($rankProgress['rank']['name'] === $rankName) {
                        // Convert percentage to stars (0-100% → 0-5 stars)
                        $stars = ($rankProgress['percentage'] / 100) * 5;
                        $totalStars += $stars;
                        $playerCount++;
                        break;
                    }
                }
            }

            $averageStarsByRank[$rankName] = $playerCount > 0 ? round($totalStars / $playerCount, 1) : 0;
        }

        // Calculate average rank
        $averageRankLevel = $players->count() > 0 ? $totalRankLevel / $players->count() : 0;
        $averageRankName = 'Bronze'; // Default

        if ($averageRankLevel >= 3.5) {
            $averageRankName = 'Platinum';
        } elseif ($averageRankLevel >= 2.5) {
            $averageRankName = 'Gold';
        } elseif ($averageRankLevel >= 1.5) {
            $averageRankName = 'Silver';
        }

        // Calculate stats
        $stats = [
            'totalPlayers' => $players->count(),
            'averageRank' => [
                'name' => $averageRankName,
                'level' => round($averageRankLevel, 1),
            ],
            'averageStarsByRank' => $averageStarsByRank,
            'rankDistribution' => $rankDistribution,
            'averageCompletion' => $players->count() > 0 ? round($players->avg('overallProgress'), 1) : 0,
        ];

        return Inertia::render('player-progress/index', [
            'players' => $players,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
