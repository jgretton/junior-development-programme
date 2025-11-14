<?php

namespace App\Observers;

use App\Models\PlayerProgress;
use App\Services\PlayerProgressSummaryService;

class PlayerProgressObserver
{
    protected PlayerProgressSummaryService $summaryService;

    public function __construct(PlayerProgressSummaryService $summaryService)
    {
        $this->summaryService = $summaryService;
    }

    /**
     * Handle the PlayerProgress "created" event.
     */
    public function created(PlayerProgress $playerProgress): void
    {
        $this->updateSummary($playerProgress);
    }

    /**
     * Handle the PlayerProgress "updated" event.
     */
    public function updated(PlayerProgress $playerProgress): void
    {
        $this->updateSummary($playerProgress);
    }

    /**
     * Handle the PlayerProgress "deleted" event.
     */
    public function deleted(PlayerProgress $playerProgress): void
    {
        $this->updateSummary($playerProgress);
    }

    /**
     * Update the player's summary
     */
    protected function updateSummary(PlayerProgress $playerProgress): void
    {
        // Update summary for the affected player
        $this->summaryService->updateForPlayer($playerProgress->user_id);
    }
}
