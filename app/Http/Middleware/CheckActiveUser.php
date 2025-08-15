<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckActiveUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Check if user account is active
        if (!$user->is_aktif) {
            // If it's an API request, return JSON response
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akun Anda tidak aktif. Silahkan hubungi administrator.',
                    'status' => 'inactive'
                ], 403);
            }

            // For web requests, show inactive account page
            return Inertia::render('Auth/account-inactive', [
                'user' => [
                    'nama_lengkap' => $user->nama_lengkap,
                    'email' => $user->email,
                    'telepon' => $user->telepon,
                ],
                'message' => 'Akun Anda sedang tidak aktif. Silahkan hubungi administrator untuk mengaktifkan kembali akun Anda.'
            ]);
        }

        return $next($request);
    }
}
