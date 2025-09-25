<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Enums\Status;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCoachRequest;
use App\Http\Requests\UpdateCoachesRequest;
use App\Models\User;
use App\Services\InvitationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CoachesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $coaches = User::whereNot('role', Role::PLAYER)
            ->select(['id', 'name', 'role', 'email', 'last_login_at', 'status'])
            ->get();
        return Inertia::render('admin/coaches/index', [
            'coaches' => $coaches,
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
    public function store(StoreCoachRequest $request)
    {
        try {
            $request->validated();

            $token = Str::uuid()->toString();
            $user = User::create([
                'name' => $request->validated()['name'],
                'email' => $request->validated()['email'],
                'guardian_email' => null,
                'status' => Status::PENDING,
                'role' => $request->validated()['role'],
                'signup_token' => $token,
                'signup_token_expires_at' => now()->addDays(30),
            ]);

            // Use InvitationService to send invitation
            if (InvitationService::sendInvitation($user)) {
                return redirect()->route('coaches.index')->with('success', 'Coach invited successfully!');
            } else {
                return redirect()->route('coaches.index')->with('warning', 'Coach created but invitation failed to send. You can resend it from the coaches list.');
            }
        } catch (\Exception $e) {
            Log::error('CoachesController@store failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->validated(),
            ]);

            return redirect()
                ->back()
                ->withErrors(['general' => $e->getMessage()])
                ->withInput();
        }
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
    public function update(UpdateCoachesRequest $request, User $coach)
    {
        try {
            $validated = $request->validated();

            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
            ];

            // Only allow status changes for non-pending users
            if ($coach->status !== 'pending') {
                $updateData['status'] = $validated['status'];
            }

            $coach->update($updateData);

            return redirect()->route('coaches.index')->with('success', 'Coach updated successfully!');
        } catch (\Exception $e) {
            Log::error('CoachesController@update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->validated(),
                'player_id' => $coach->id,
            ]);

            return redirect()
                ->back()
                ->withErrors(['general' => 'Failed to update coach. Please try again.'])
                ->withInput();
        }
    }

    /**
     * Resend invitation email to coach.
     */
    public function resendInvitation(User $coach)
    {
        if (InvitationService::resendInvitation($coach)) {
            return redirect()->back()->with('success', "Invitation resent successfully to {$coach->name}");
        } else {
            return redirect()->back()->with('error', 'Failed to resend invitation. Please try again.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $coach)
    {
        try {
            if ($coach->id === auth()->id()) {
                return redirect()->back()->with('error', 'You cannot delete yourself');
            }

            $coach->delete();
            return redirect()->back()->with('success', 'Coach deleted successfully');
        } catch (\Exception $e) {
            Log::error('Coach deletion failed', ['coach_id' => $coach->id, 'error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete coach');
        }
    }
}
