<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Criteria;
use App\Models\PlayerProgress;
use App\Models\PlayerProgressSummary;
use App\Models\Rank;
use Illuminate\Support\Facades\DB;

class PlayerProgressSummaryService
{
    /**
     * Update or create summary for a specific player
     */
    public function updateForPlayer(int $userId): void
    {
        // Get all ranks and categories (cached would be better in production)
        $ranks = Rank::orderBy('level')->get();
        $categories = Category::all();
        $totalCriteriaCount = Criteria::count();

        // Get player's completed progress counts using efficient aggregation
        $completedByRank = $this->getCompletedByRank($userId);
        $completedByCategory = $this->getCompletedByCategory($userId);
        $completedByCategoryRank = $this->getCompletedByCategoryRank($userId);

        // Calculate rank progress
        $rankProgress = [];
        foreach ($ranks as $rank) {
            $total = Criteria::where('rank_id', $rank->id)->count();
            $completed = $completedByRank[$rank->id] ?? 0;
            $percentage = $total > 0 ? round(($completed / $total) * 100) : 0;

            $rankProgress[$rank->name] = [
                'name' => $rank->name,
                'level' => $rank->level,
                'completed' => $completed,
                'total' => $total,
                'percentage' => $percentage,
            ];
        }

        // Calculate category progress
        $categoryProgress = [];
        foreach ($categories as $category) {
            $total = Criteria::where('category_id', $category->id)->count();
            $completed = $completedByCategory[$category->id] ?? 0;
            $percentage = $total > 0 ? round(($completed / $total) * 100) : 0;

            // Calculate category rank (lowest incomplete rank)
            $categoryRank = $this->determineCategoryRank($userId, $category->id, $ranks, $completedByCategoryRank);

            $categoryProgress[$category->name] = [
                'rank' => $categoryRank,
                'completed' => $completed,
                'total' => $total,
                'percentage' => $percentage,
            ];
        }

        // Determine current overall rank (lowest incomplete rank)
        $currentRankId = $this->determineCurrentRank($rankProgress, $ranks);

        // Calculate overall stats
        $overallCompleted = PlayerProgress::where('user_id', $userId)
            ->where('status', 'COMPLETED')
            ->count();

        $overallPercentage = $totalCriteriaCount > 0
            ? round(($overallCompleted / $totalCriteriaCount) * 100, 2)
            : 0;

        // Update or create summary
        PlayerProgressSummary::updateOrCreate(
            ['user_id' => $userId],
            [
                'current_rank_id' => $currentRankId,
                'overall_percentage' => $overallPercentage,
                'overall_completed' => $overallCompleted,
                'overall_total' => $totalCriteriaCount,
                'rank_progress' => $rankProgress,
                'category_progress' => $categoryProgress,
            ]
        );
    }

    /**
     * Get completed counts grouped by rank for a player
     */
    private function getCompletedByRank(int $userId): array
    {
        $results = DB::table('player_progress')
            ->join('criterias', 'player_progress.criteria_id', '=', 'criterias.id')
            ->where('player_progress.user_id', $userId)
            ->where('player_progress.status', 'COMPLETED')
            ->groupBy('criterias.rank_id')
            ->select('criterias.rank_id', DB::raw('COUNT(*) as count'))
            ->get();

        $grouped = [];
        foreach ($results as $result) {
            $grouped[$result->rank_id] = $result->count;
        }

        return $grouped;
    }

    /**
     * Get completed counts grouped by category for a player
     */
    private function getCompletedByCategory(int $userId): array
    {
        $results = DB::table('player_progress')
            ->join('criterias', 'player_progress.criteria_id', '=', 'criterias.id')
            ->where('player_progress.user_id', $userId)
            ->where('player_progress.status', 'COMPLETED')
            ->groupBy('criterias.category_id')
            ->select('criterias.category_id', DB::raw('COUNT(*) as count'))
            ->get();

        $grouped = [];
        foreach ($results as $result) {
            $grouped[$result->category_id] = $result->count;
        }

        return $grouped;
    }

    /**
     * Get completed counts grouped by category and rank for a player
     */
    private function getCompletedByCategoryRank(int $userId): array
    {
        $results = DB::table('player_progress')
            ->join('criterias', 'player_progress.criteria_id', '=', 'criterias.id')
            ->where('player_progress.user_id', $userId)
            ->where('player_progress.status', 'COMPLETED')
            ->groupBy('criterias.category_id', 'criterias.rank_id')
            ->select('criterias.category_id', 'criterias.rank_id', DB::raw('COUNT(*) as count'))
            ->get();

        $grouped = [];
        foreach ($results as $result) {
            $grouped[$result->category_id][$result->rank_id] = $result->count;
        }

        return $grouped;
    }

    /**
     * Determine the current overall rank (lowest incomplete rank)
     */
    private function determineCurrentRank(array $rankProgress, $ranks): ?int
    {
        foreach ($ranks as $rank) {
            $progress = $rankProgress[$rank->name] ?? null;
            if ($progress && $progress['percentage'] < 100) {
                return $rank->id;
            }
        }

        // If all ranks are 100%, return the highest rank
        return $ranks->last()->id ?? null;
    }

    /**
     * Determine the category rank (lowest incomplete rank for this category)
     */
    private function determineCategoryRank(int $userId, int $categoryId, $ranks, array $completedByCategoryRank): string
    {
        foreach ($ranks as $rank) {
            $total = Criteria::where('category_id', $categoryId)
                ->where('rank_id', $rank->id)
                ->count();

            if ($total === 0) {
                continue;
            }

            $completed = $completedByCategoryRank[$categoryId][$rank->id] ?? 0;
            $percentage = round(($completed / $total) * 100);

            if ($percentage < 100) {
                return $rank->name;
            }
        }

        // If all ranks are 100%, return the highest rank
        return $ranks->last()->name ?? 'Bronze';
    }

    /**
     * Rebuild summaries for all players
     */
    public function rebuildAll(): void
    {
        $userIds = DB::table('users')
            ->where('role', 'player')
            ->pluck('id');

        foreach ($userIds as $userId) {
            $this->updateForPlayer($userId);
        }
    }
}
