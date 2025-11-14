<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__ . '/../routes/web.php', commands: __DIR__ . '/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'coach.or.admin' => \App\Http\Middleware\CoachOrAdminMiddleware::class,
            'observer.or.coach.or.admin' => \App\Http\Middleware\AdminCoachOrObserver::class,
            'update.lastlogin' => \App\Http\Middleware\TrackLastLogin::class,
            // ... other middleware
        ]);
        $middleware->web(append: [HandleAppearance::class, HandleInertiaRequests::class, AddLinkHeadersForPreloadedAssets::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
