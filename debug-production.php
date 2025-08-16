<?php
/**
 * Debug script untuk production deployment issues
 * Jalankan dengan: php debug-production.php
 */

echo "🔍 DEBUGGING PRODUCTION DEPLOYMENT ISSUES\n";
echo "========================================\n\n";

// Check environment
echo "1. ENVIRONMENT CHECK:\n";
echo "APP_ENV: " . (env('APP_ENV') ?? 'not set') . "\n";
echo "APP_DEBUG: " . (env('APP_DEBUG') ? 'true' : 'false') . "\n";
echo "APP_URL: " . (env('APP_URL') ?? 'not set') . "\n";
echo "DB_CONNECTION: " . (env('DB_CONNECTION') ?? 'not set') . "\n\n";

// Check database connection
echo "2. DATABASE CONNECTION:\n";
try {
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "✅ Database connection: OK\n";
    
    // Check if roles table exists and has data
    $rolesCount = \Illuminate\Support\Facades\DB::table('roles')->count();
    echo "Roles in database: $rolesCount\n";
    
    if ($rolesCount > 0) {
        $roles = \Illuminate\Support\Facades\DB::table('roles')->pluck('name')->toArray();
        echo "Available roles: " . implode(', ', $roles) . "\n";
    }
    
    // Check users with roles
    $usersWithRoles = \Illuminate\Support\Facades\DB::table('model_has_roles')
        ->join('users', 'model_has_roles.model_id', '=', 'users.id')
        ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
        ->select('users.email', 'roles.name as role_name')
        ->get();
    
    echo "Users with roles:\n";
    foreach ($usersWithRoles as $user) {
        echo "  - {$user->email}: {$user->role_name}\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
echo "\n";

// Check cache
echo "3. CACHE STATUS:\n";
if (file_exists(__DIR__ . '/bootstrap/cache/config.php')) {
    echo "✅ Config cache exists\n";
} else {
    echo "⚠️  Config cache missing\n";
}

if (file_exists(__DIR__ . '/bootstrap/cache/routes-v7.php')) {
    echo "✅ Route cache exists\n";
} else {
    echo "⚠️  Route cache missing\n";
}
echo "\n";

// Check routes
echo "4. ROUTE CHECK:\n";
try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $dokterRoutes = [];
    
    foreach ($routes as $route) {
        if (str_contains($route->getName() ?? '', 'dokter.rekam-medis')) {
            $dokterRoutes[] = [
                'name' => $route->getName(),
                'uri' => $route->uri(),
                'methods' => implode('|', $route->methods()),
                'middleware' => implode(', ', $route->gatherMiddleware())
            ];
        }
    }
    
    if (empty($dokterRoutes)) {
        echo "❌ No dokter.rekam-medis routes found!\n";
    } else {
        echo "✅ Found " . count($dokterRoutes) . " dokter.rekam-medis routes:\n";
        foreach ($dokterRoutes as $route) {
            echo "  - {$route['name']}: {$route['methods']} /{$route['uri']} [{$route['middleware']}]\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Route check failed: " . $e->getMessage() . "\n";
}
echo "\n";

// Check file permissions
echo "5. FILE PERMISSIONS:\n";
$checkDirs = ['storage', 'bootstrap/cache', 'public'];
foreach ($checkDirs as $dir) {
    if (is_dir($dir)) {
        $perms = substr(sprintf('%o', fileperms($dir)), -4);
        $writable = is_writable($dir) ? '✅' : '❌';
        echo "$writable $dir: $perms\n";
    } else {
        echo "❌ $dir: does not exist\n";
    }
}
echo "\n";

// Check Spatie Permission
echo "6. SPATIE PERMISSION CHECK:\n";
try {
    if (class_exists('Spatie\Permission\Models\Role')) {
        echo "✅ Spatie Permission package loaded\n";
        
        // Check if tables exist
        $tables = ['roles', 'permissions', 'model_has_roles', 'model_has_permissions', 'role_has_permissions'];
        foreach ($tables as $table) {
            if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                echo "✅ Table $table exists\n";
            } else {
                echo "❌ Table $table missing\n";
            }
        }
    } else {
        echo "❌ Spatie Permission package not loaded\n";
    }
} catch (\Exception $e) {
    echo "❌ Spatie Permission check failed: " . $e->getMessage() . "\n";
}
echo "\n";

// Check web server configuration
echo "7. WEB SERVER CONFIGURATION:\n";
if (isset($_SERVER['SERVER_SOFTWARE'])) {
    echo "Server software: " . $_SERVER['SERVER_SOFTWARE'] . "\n";
} else {
    echo "Running in CLI mode\n";
}

echo "Document root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Not available in CLI') . "\n";
echo "PHP Version: " . PHP_VERSION . "\n";
echo "\n";

echo "🎯 RECOMMENDATIONS:\n";
echo "==================\n";
echo "1. Run: php artisan config:clear && php artisan route:clear && php artisan cache:clear\n";
echo "2. Run: php artisan config:cache && php artisan route:cache\n";
echo "3. Check your .env file has correct APP_URL\n";
echo "4. Ensure database has proper roles seeded\n";
echo "5. Check web server configuration (Apache/Nginx)\n";
echo "6. Verify file permissions are correct\n";
echo "\n";

echo "✅ Debug completed!\n";
