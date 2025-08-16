<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Anda harus login terlebih dahulu.');
        }

        $user = Auth::user();

        // Log for debugging
        Log::info('RoleMiddleware: Checking user roles', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'required_roles' => $roles,
            'user_roles' => $user->roles->pluck('name')->toArray()
        ]);

        // Check if user has any of the required roles using Spatie
        if (!empty($roles)) {
            // Convert roles array to handle multiple roles separated by |
            $requiredRoles = [];
            foreach ($roles as $role) {
                if (strpos($role, '|') !== false) {
                    $requiredRoles = array_merge($requiredRoles, explode('|', $role));
                } else {
                    $requiredRoles[] = $role;
                }
            }

            // Check if user has any of the required roles using Spatie's relationship
            $userRoleNames = $user->roles->pluck('name')->toArray();
            $hasRole = !empty(array_intersect($requiredRoles, $userRoleNames));

            Log::info('RoleMiddleware: Role check result', [
                'user_id' => $user->id,
                'required_roles' => $requiredRoles,
                'user_roles' => $userRoleNames,
                'has_role' => $hasRole
            ]);

            if (!$hasRole) {
                Log::warning('RoleMiddleware: Access denied - no matching role', [
                    'user_id' => $user->id,
                    'required_roles' => $requiredRoles,
                    'user_roles' => $userRoleNames,
                    'requested_url' => $request->url()
                ]);

                // Redirect to dashboard with error message
                return redirect()->route('dashboard')
                    ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
            }
        }

        Log::info('RoleMiddleware: Access granted', [
            'user_id' => $user->id,
            'url' => $request->url()
        ]);

        return $next($request);
    }
}
