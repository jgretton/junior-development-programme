<?php

namespace App\Console\Commands;

use App\Services\PlayerProgressSummaryService;
use Illuminate\Console\Command;

class RebuildPlayerProgressSummary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'player-progress:rebuild-summary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild player progress summary table for all players';

    /**
     * Execute the console command.
     */
    public function handle(PlayerProgressSummaryService $service)
    {
        $this->info('Rebuilding player progress summaries...');

        $service->rebuildAll();

        $this->info('Player progress summaries rebuilt successfully!');

        return Command::SUCCESS;
    }
}
