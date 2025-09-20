<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Enums\Status;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlayerRequest;
use Illuminate\Support\Str;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /**
         * Returning all players
         */

        try {
            $players = User::where('role', Role::PLAYER)
                ->select(['id', 'name', 'email', 'status', 'guardian_email', 'last_login_at'])
                ->get();

            return Inertia::render('admin/players/index', [
                'players' => $players,
            ]);
        } catch (\Exception $e) {
            // Log the actual error for debugging
            Log::error('PlayerController@index failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return user-friendly message regardless of error type
            return Inertia::render('admin/players/index', [
                'players' => [],
                'error' => 'Unable to load players. Please try again or contact support if this continues.',
            ]);
        }
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
    public function store(StorePlayerRequest $request)
    {
        //
        $token = Str::uuid()->toString();
        $user = User::create([
            'name' => $request->validated()['name'],
            'email' => $request->validated()['email'],
            'guardian_email' => $request->validated()['guardian_email'],
            'status' => Status::PENDING,
            'role' => Role::PLAYER,
            'signup_token' => $token,
            'signup_token_expires_at' => now()->addDays(30),
        ]);
        // dd($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}
