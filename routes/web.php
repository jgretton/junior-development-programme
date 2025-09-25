<?php

use App\Http\Controllers\Admin\CoachesController;
use App\Http\Controllers\Admin\PlayerController;
use App\Mail\PlayerInvitation;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'update.lastlogin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('admin')
    ->middleware(['auth', 'admin'])
    ->group(function () {
        Route::resource('players', PlayerController::class);
        Route::resource('coaches', CoachesController::class);

        // Resend invitation routes
        Route::post('coaches/{coach}/resend-invitation', [CoachesController::class, 'resendInvitation'])
            ->name('coaches.resend-invitation');
        Route::post('players/{player}/resend-invitation', [PlayerController::class, 'resendInvitation'])
            ->name('players.resend-invitation');
    });

Route::get('/emails', function () {
    // Create a test user object
    $testUser = new \App\Models\User([
        'name' => 'Josh Gretton',
        'email' => 'jb.gretton@googlemail.com',
        'signup_token' => 'test-token-12345',
    ]);

    return new PlayerInvitation($testUser);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
