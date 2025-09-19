<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /**
         * check if they are logged in, if not redirect to login
         */
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        if (Auth::user()->role !== Role::ADMIN) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
