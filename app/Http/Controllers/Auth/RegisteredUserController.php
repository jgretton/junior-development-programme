<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Status;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $token = $request->query('token'); // Get token from URL

        if (!$token) {
            return redirect()->route('home');
        }

        $user = User::where('signup_token', $token)->first();

        if (!$user) {
            return redirect()->route('home');
        }

        // if ($user->signup_token_expires_at <= now()) {
        //     return Inertia::render('auth/token-expired', [
        //         'contactName' => 'Naz',
        //         'userEmail' => $user->email,
        //     ]);
        // }

        return Inertia::render('auth/register', [
            'user' => $user->only(['name', 'email']),
            'token' => $token,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'signup_token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::where('signup_token', $request->signup_token)->where('signup_token_expires_at', '>', now())->first();

        if (!$user) {
            return back()->withErrors(['token' => 'Invalid or expired token']);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'signup_token' => null, // Clear the token
            'signup_token_expires_at' => null,
            'status' => Status::ACTIVE,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
