#!/bin/bash

echo "🕵️ DETECTING REDIRECT ISSUE - ADVANCED DIAGNOSIS"
echo "==============================================="
echo ""

# Check if we're in Laravel directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this from Laravel root directory"
    exit 1
fi

APP_URL=$(php -r "echo env('APP_URL', 'http://localhost');")
DOMAIN=$(echo $APP_URL | sed 's|.*://||' | sed 's|/.*||')

echo "🌐 Testing domain: $DOMAIN"
echo "📍 App URL: $APP_URL"
echo ""

# Test 1: Check if routes are actually registered
echo "1. 🔍 CHECKING ROUTE REGISTRATION"
echo "---------------------------------"
php artisan route:list --name=dokter.rekam-medis --columns=name,uri,middleware || {
    echo "❌ dokter.rekam-medis routes not found!"
    echo "This might be the issue. Let's check all dokter routes..."
    php artisan route:list | grep dokter | grep -v debug
}
echo ""

# Test 2: Test middleware chain
echo "2. 🛡️ TESTING MIDDLEWARE CHAIN" 
echo "------------------------------"
echo "Checking middleware registration..."
if grep -rn "role.*dokter" app/Http/Middleware/ >/dev/null 2>&1; then
    echo "✅ Role middleware found"
else
    echo "❌ Role middleware might have issues"
fi

# Check kernel middleware registration
echo "Checking kernel middleware registration..."
if grep -n "RoleMiddleware" app/Http/Kernel.php; then
    echo "✅ RoleMiddleware registered in kernel"
else
    echo "❌ RoleMiddleware not found in kernel!"
fi
echo ""

# Test 3: Simulate the exact request flow
echo "3. 🔄 SIMULATING REQUEST FLOW"
echo "-----------------------------"
php artisan tinker --execute="
echo '🧪 Testing route resolution...' . PHP_EOL;
try {
    \$route = Route::getRoutes()->getByName('dokter.rekam-medis.index');
    if (\$route) {
        echo '✅ Route found: ' . \$route->uri() . PHP_EOL;
        echo 'Middleware: ' . implode(', ', \$route->gatherMiddleware()) . PHP_EOL;
        
        // Check if user can access
        if (Auth::check()) {
            \$user = Auth::user();
            echo 'Current user: ' . \$user->email . PHP_EOL;
            echo 'User roles: ' . implode(', ', \$user->roles->pluck('name')->toArray()) . PHP_EOL;
            
            // Manual role check
            \$hasRole = \$user->roles->pluck('name')->contains('dokter');
            echo 'Has dokter role: ' . (\$hasRole ? 'YES' : 'NO') . PHP_EOL;
            
            if (!\$hasRole) {
                echo '❌ USER DOES NOT HAVE DOKTER ROLE - THIS IS THE ISSUE!' . PHP_EOL;
            }
        } else {
            echo '❌ NO USER AUTHENTICATED' . PHP_EOL;
        }
    } else {
        echo '❌ Route not found!' . PHP_EOL;
    }
} catch (Exception \$e) {
    echo '❌ Error: ' . \$e->getMessage() . PHP_EOL;
}
"
echo ""

# Test 4: Check web server rewrite rules
echo "4. 🌐 CHECKING WEB SERVER CONFIGURATION"
echo "--------------------------------------"
if [ -f "public/.htaccess" ]; then
    echo "✅ Apache .htaccess found"
    echo "Checking rewrite rules..."
    if grep -q "RewriteRule.*index.php" public/.htaccess; then
        echo "✅ Rewrite rules look correct"
    else
        echo "❌ Rewrite rules might be incorrect"
    fi
else
    echo "⚠️  No .htaccess found (might be using Nginx)"
fi
echo ""

# Test 5: Check for session/auth issues
echo "5. 🔐 CHECKING SESSION AND AUTH"
echo "-------------------------------"
echo "Session driver: $(php -r "echo config('session.driver');")"
echo "Session lifetime: $(php -r "echo config('session.lifetime');") minutes"
echo "Auth guard: $(php -r "echo config('auth.defaults.guard');")"
echo ""

# Test 6: Look for specific error patterns
echo "6. 📋 CHECKING LOG FILES"
echo "-----------------------"
if [ -f "storage/logs/laravel.log" ]; then
    echo "Recent RoleMiddleware entries:"
    tail -50 storage/logs/laravel.log | grep -i "rolemiddleware\|access denied" | tail -5 || echo "No recent RoleMiddleware logs found"
    echo ""
    echo "Recent redirect entries:"
    tail -100 storage/logs/laravel.log | grep -i "redirect\|dashboard" | tail -3 || echo "No recent redirect logs found"
else
    echo "❌ No log file found"
fi
echo ""

# Test 7: Direct curl test
echo "7. 🌐 TESTING HTTP REQUESTS"
echo "---------------------------"
echo "Testing dashboard access..."
curl -s -o /dev/null -w "Dashboard HTTP Status: %{http_code}\n" "$APP_URL/dashboard" || echo "Curl failed - check if server is accessible"

echo "Testing dokter route access..."
curl -s -o /dev/null -w "Dokter Route HTTP Status: %{http_code}\n" "$APP_URL/dokter/rekam-medis" || echo "Curl failed - check if server is accessible"
echo ""

# Generate specific fix suggestions
echo "8. 💡 SPECIFIC FIX SUGGESTIONS"
echo "=============================="
echo ""
echo "Based on your debug info showing user has correct roles but still gets redirected:"
echo ""
echo "🎯 MOST LIKELY CAUSES:"
echo ""
echo "A. MIDDLEWARE ORDER ISSUE:"
echo "   Check if 'role:dokter' middleware is applied correctly"
echo "   Run: php artisan route:list --name=dokter.rekam-medis"
echo ""
echo "B. SESSION/COOKIE ISSUE:"
echo "   - Clear browser cookies for your domain"
echo "   - Check if session is persisting across requests"
echo "   - Verify APP_KEY is same between environments"
echo ""
echo "C. CACHE POISONING:"
echo "   php artisan config:clear"
echo "   php artisan route:clear" 
echo "   php artisan cache:clear"
echo "   php artisan config:cache"
echo "   php artisan route:cache"
echo ""
echo "D. MIDDLEWARE LOGIC ERROR:"
echo "   The RoleMiddleware might be redirecting incorrectly"
echo "   Check the updated middleware code in production"
echo ""
echo "E. WEB SERVER REDIRECT:"
echo "   Check .htaccess or nginx config for redirect rules"
echo "   Look for redirects happening before Laravel"
echo ""
echo "🔧 IMMEDIATE TESTS TO RUN:"
echo ""
echo "1. Test middleware directly:"
echo "   Visit: $APP_URL/debug/test-middleware-flow"
echo ""
echo "2. Test without middleware:"
echo "   Visit: $APP_URL/debug/test-dokter-access"
echo ""
echo "3. Clear ALL caches and try again:"
echo "   ./deploy-production.sh"
echo ""
echo "4. Check browser network tab for redirect chain"
echo ""
echo "✅ Advanced diagnosis completed!"
