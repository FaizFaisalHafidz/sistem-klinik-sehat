<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Route untuk test middleware dan akses langsung
Route::middleware(['web', 'auth'])->get('/debug/test-dokter-access', function () {
    if (!Auth::check()) {
        return response()->json(['error' => 'Not authenticated']);
    }
    
    $user = Auth::user();
    
    // Test middleware secara manual
    $roleMiddleware = new \App\Http\Middleware\RoleMiddleware();
    
    try {
        $request = request();
        $response = $roleMiddleware->handle($request, function ($request) {
            return response()->json(['middleware' => 'passed']);
        }, 'dokter');
        
        $middlewareResult = $response->getContent();
    } catch (\Exception $e) {
        $middlewareResult = 'Error: ' . $e->getMessage();
    }
    
    return response()->json([
        'user_id' => $user->id,
        'user_roles' => $user->roles->pluck('name')->toArray(),
        'middleware_test' => $middlewareResult,
        'direct_route_test' => 'This route works!',
        'server_info' => [
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'CLI',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI',
            'http_host' => $_SERVER['HTTP_HOST'] ?? 'CLI',
        ]
    ]);
});

// Route untuk test redirect issue
Route::middleware(['web', 'auth', 'role:dokter'])->get('/debug/test-middleware-flow', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Middleware flow works correctly',
        'user' => [
            'id' => Auth::user()->id,
            'email' => Auth::user()->email,
            'nama_lengkap' => Auth::user()->nama_lengkap
        ],
        'roles' => Auth::user()->roles->pluck('name')->toArray(),
        'timestamp' => now()
    ]);
});

// Route untuk simulate masalah
Route::middleware(['web'])->get('/debug/simulate-issue', function () {
    // Test tanpa auth untuk melihat redirect behavior
    if (!Auth::check()) {
        return redirect()->route('login')->with('test_message', 'Redirected to login');
    }
    
    $user = Auth::user();
    
    // Simulate role check
    $hasRole = $user->roles->pluck('name')->contains('dokter');
    
    if (!$hasRole) {
        return redirect()->route('dashboard')->with('test_message', 'Redirected to dashboard - no dokter role');
    }
    
    return response()->json([
        'status' => 'access_granted',
        'user_id' => $user->id,
        'roles' => $user->roles->pluck('name')->toArray()
    ]);
});
