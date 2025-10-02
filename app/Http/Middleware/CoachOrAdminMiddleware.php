<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CoachOrAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $allowedRoles = [Role::ADMIN, Role::JUNIOR_DEVELOPMENT_COACH];

        if (!in_array(Auth::user()->role, $allowedRoles)) {
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }
        return $next($request);
    }
}
