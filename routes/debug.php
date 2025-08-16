<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::middleware(['web', 'auth'])->get('/debug/user-roles', function () {
    if (!Auth::check()) {
        return response()->json(['error' => 'Not authenticated']);
    }
    
    $user = Auth::user();
    
    return response()->json([
        'user_id' => $user->id,
        'user_email' => $user->email,
        'user_name' => $user->nama_lengkap,
        'roles' => $user->roles->pluck('name')->toArray(),
        'permissions' => $user->permissions->pluck('name')->toArray(),
        'can_access_dokter_routes' => $user->roles->pluck('name')->contains('dokter'),
        'routes' => [
            'dokter.rekam-medis.index' => route('dokter.rekam-medis.index'),
            'dashboard' => route('dashboard'),
        ]
    ]);
});

Route::middleware(['web'])->get('/debug/routes', function () {
    $routes = collect(Route::getRoutes())->filter(function ($route) {
        return str_contains($route->getName() ?? '', 'dokter.rekam-medis');
    })->map(function ($route) {
        return [
            'name' => $route->getName(),
            'uri' => $route->uri(),
            'methods' => $route->methods(),
            'middleware' => $route->gatherMiddleware(),
        ];
    });
    
    return response()->json($routes);
});
