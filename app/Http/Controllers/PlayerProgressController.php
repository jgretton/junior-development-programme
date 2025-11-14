<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Category;
use App\Models\Criteria;
use App\Models\PlayerProgress;
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
        // Get all ranks ordered by level
        $ranks = Rank::orderBy('level')->get();

        // Get all categories
        $categories = Category::all();

        // Get all criteria count (total possible criteria)
        $totalCriteriaCount = Criteria::count();

        // Get all players with their progress
        $players = User::where('role', Role::PLAYER)
            ->with(['playerProgress.criteria.rank', 'playerProgress.criteria.category'])
            ->get()
            ->map(function ($player) use ($ranks, $categories, $totalCriteriaCount) {
                // Calculate progress by rank
                $progressByRank = $ranks->map(function ($rank) use ($player) {
                    $criteriaForRank = Criteria::where('rank_id', $rank->id)->count();
                    $completedForRank = $player->playerProgress()
                        ->whereHas('criteria', fn($q) => $q->where('rank_id', $rank->id))
                        ->where('status', 'COMPLETED')
                        ->count();

                    return [
                        'rank' => [
                            'name' => $rank->name,
                            'level' => $rank->level,
                        ],
                        'completed' => $completedForRank,
                        'total' => $criteriaForRank,
                        'percentage' => $criteriaForRank > 0
                            ? round(($completedForRank / $criteriaForRank) * 100)
                            : 0,
                    ];
                });

                // Calculate current rank (lowest incomplete rank)
                $currentRank = null;
                foreach ($progressByRank as $rankProgress) {
                    if ($rankProgress['percentage'] < 100) {
                        $currentRank = $rankProgress['rank'];
                        break;
                    }
                }
                // If all ranks are 100%, use the highest rank
                if (!$currentRank) {
                    $currentRank = $progressByRank->last()['rank'];
                }

                // Calculate category ranks
                $categoryRanks = [];
                foreach ($categories as $category) {
                    // Get criteria for this category grouped by rank
                    $categoryRankProgress = $ranks->map(function ($rank) use ($player, $category) {
                        $criteriaForCategoryRank = Criteria::where('category_id', $category->id)
                            ->where('rank_id', $rank->id)
                            ->count();

                        $completedForCategoryRank = $player->playerProgress()
                            ->whereHas('criteria', fn($q) =>
                                $q->where('category_id', $category->id)
                                  ->where('rank_id', $rank->id)
                            )
                            ->where('status', 'COMPLETED')
                            ->count();

                        return [
                            'rank' => $rank->name,
                            'completed' => $completedForCategoryRank,
                            'total' => $criteriaForCategoryRank,
                            'percentage' => $criteriaForCategoryRank > 0
                                ? round(($completedForCategoryRank / $criteriaForCategoryRank) * 100)
                                : 0,
                        ];
                    });

                    // Determine category rank (lowest incomplete)
                    $categoryCurrentRank = null;
                    foreach ($categoryRankProgress as $rankProg) {
                        if ($rankProg['percentage'] < 100) {
                            $categoryCurrentRank = $rankProg['rank'];
                            break;
                        }
                    }
                    if (!$categoryCurrentRank) {
                        $categoryCurrentRank = $categoryRankProgress->last()['rank'];
                    }

                    // Overall category percentage
                    $totalCategoryCriteria = Criteria::where('category_id', $category->id)->count();
                    $completedCategoryCriteria = $player->playerProgress()
                        ->whereHas('criteria', fn($q) => $q->where('category_id', $category->id))
                        ->where('status', 'COMPLETED')
                        ->count();

                    $categoryPercentage = $totalCategoryCriteria > 0
                        ? round(($completedCategoryCriteria / $totalCategoryCriteria) * 100)
                        : 0;

                    $categoryRanks[$category->name] = [
                        'rank' => $categoryCurrentRank,
                        'percentage' => $categoryPercentage,
                    ];
                }

                // Overall stats
                $completedCriteria = $player->playerProgress()
                    ->where('status', 'COMPLETED')
                    ->count();

                $pendingCriteria = $player->playerProgress()
                    ->where('status', 'PENDING')
                    ->count();

                $overallPercentage = $totalCriteriaCount > 0
                    ? round(($completedCriteria / $totalCriteriaCount) * 100)
                    : 0;

                return [
                    'id' => $player->id,
                    'name' => $player->name,
                    'email' => $player->email,
                    'currentRank' => $currentRank,
                    'overallProgress' => $overallPercentage,
                    'categoryRanks' => $categoryRanks,
                    'progressByRank' => $progressByRank->toArray(),
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
            'rankDistribution' => $rankDistribution,
            'averageCompletion' => $players->count() > 0
                ? round($players->avg('overallProgress'), 1)
                : 0,
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
