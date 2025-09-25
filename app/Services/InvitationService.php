<?php

namespace App\Services;

use App\Mail\PlayerInvitation;
use App\Models\User;
use App\Enums\Status;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationService
{
    /**
     * Send initial invitation to a new user
     */
    public static function sendInvitation(User $user)
    {
        try {
            // 1. Validate user has email
            if (empty($user->email)) {
                Log::error('Cannot send invitation - no email', ['user_id' => $user->id]);
                return false;
            }

            // 2. Validate user is pending
            if ($user->status !== Status::PENDING) {
                Log::error('Cannot send invitation - not pending', ['user_id' => $user->id]);
                return false;
            }

            // 3. Send the email
            Mail::to($user->email)->send(new PlayerInvitation($user));

            // 4. Log success
            Log::info('Invitation sent successfully', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to send invitation', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Resend invitation with new token and expiry
     */
    public static function resendInvitation(User $user)
    {
        try {
            // 1. Same validation as sendInvitation
            if (empty($user->email)) {
                Log::error('Cannot resend invitation - no email', ['user_id' => $user->id]);
                return false;
            }

            if ($user->status !== Status::PENDING) {
                Log::error('Cannot resend invitation - not pending', ['user_id' => $user->id]);
                return false;
            }

            // 2. Generate NEW token and reset expiry
            $newToken = Str::uuid()->toString();
            $user->update([
                'signup_token' => $newToken,
                'signup_token_expires_at' => now()->addDays(30)
            ]);

            // 3. Send the email
            Mail::to($user->email)->send(new PlayerInvitation($user));

            // 4. Log success
            Log::info('Invitation resent successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'new_token' => $newToken
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to resend invitation', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
