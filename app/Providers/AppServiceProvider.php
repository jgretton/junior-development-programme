<?php

namespace App\Providers;

use App\Models\PlayerProgress;
use App\Observers\PlayerProgressObserver;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observers
        PlayerProgress::observe(PlayerProgressObserver::class);

        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
