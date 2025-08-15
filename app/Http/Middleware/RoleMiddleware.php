<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

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

        // Check if user has any of the required roles
        if (!empty($roles)) {
            $hasRole = false;
            foreach ($roles as $role) {
                if ($user->hasRole($role)) {
                    $hasRole = true;
                    break;
                }
            }

            if (!$hasRole) {
                // Redirect based on user's role
                if ($user->hasRole('admin')) {
                    return redirect()->route('admin.dashboard')
                        ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
                } elseif ($user->hasRole('dokter')) {
                    return redirect()->route('dokter.dashboard')
                        ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
                } elseif ($user->hasRole('pendaftaran')) {
                    return redirect()->route('pendaftaran.dashboard')
                        ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
                } elseif ($user->hasRole('apoteker')) {
                    return redirect()->route('apoteker.dashboard')
                        ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
                } else {
                    return redirect()->route('dashboard')
                        ->with('error', 'Anda tidak memiliki akses ke halaman tersebut.');
                }
            }
        }

        return $next($request);
    }
}
