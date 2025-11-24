<?php

use App\Http\Controllers\Admin\CoachesController;
use App\Http\Controllers\Admin\PlayerController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\PendingApprovalsController;
use App\Http\Controllers\PlayerProgressController;
use App\Http\Controllers\SessionController;
use App\Mail\PlayerInvitation;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('guest')->group(function () {
    Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('home');
    Route::post('/', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

// Alias for 'login' route name (used by Laravel auth middleware)
Route::redirect('/login-redirect', '/', 301)->name('login');

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
        Route::resource('pending-approvals', PendingApprovalsController::class);

        // Resend invitation routes
        Route::post('coaches/{coach}/resend-invitation', [CoachesController::class, 'resendInvitation'])->name('coaches.resend-invitation');
        Route::post('players/{player}/resend-invitation', [PlayerController::class, 'resendInvitation'])->name('players.resend-invitation');
    });

Route::middleware(['auth'])->group(function () {
    Route::middleware(['coach.or.admin'])->group(function () {
        Route::get('/sessions/create', [SessionController::class, 'create']);
        Route::post('/sessions', [SessionController::class, 'store']);
        Route::get('/sessions/{training_session}/edit', [SessionController::class, 'edit']);

        // Route::put('/sessions/{session}', [SessionController::class, 'update']);
        // Route::delete('/sessions/{session}', [SessionController::class, 'destroy']);
    });
    Route::middleware(['observer.or.coach.or.admin'])->group(function () {
        Route::get('/sessions', [SessionController::class, 'index'])->name('sessions.index');
        Route::get('/player-progress', [PlayerProgressController::class, 'index'])->name('player-progress.index');
    });
    Route::get('/sessions/{training_session}', [SessionController::class, 'show'])->name('sessions.show'); // Everyone
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
