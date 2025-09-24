<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrackLastLogin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();

            $tz = config('app.timezone');

            $today = now()->timezone($tz)->toDateString();

            $sessionKey = 'last_login_at';

            if ($request->session()->get($sessionKey) !== $today) {
                $user->last_login_at = now()->timezone($tz);
                $user->save();

                $request->session()->put($sessionKey, $today);
            }
        }
        return $next($request);
    }
}
