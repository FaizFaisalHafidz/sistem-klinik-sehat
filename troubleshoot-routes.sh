#!/bin/bash

echo "🔧 TROUBLESHOOTING LARAVEL ROUTES IN PRODUCTION"
echo "=============================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check current directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: artisan file not found. Please run this script from Laravel root directory."
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Check Laravel installation
echo "1. 🔍 CHECKING LARAVEL INSTALLATION"
echo "-----------------------------------"
php artisan --version
echo ""

# Step 2: Check environment
echo "2. 🌍 CHECKING ENVIRONMENT"
echo "-------------------------"
echo "APP_ENV: $(php -r "echo env('APP_ENV', 'not set');")"
echo "APP_DEBUG: $(php -r "echo env('APP_DEBUG', 'not set') ? 'true' : 'false';")"
echo "APP_URL: $(php -r "echo env('APP_URL', 'not set');")"
echo ""

# Step 3: Clear and rebuild caches
echo "3. 🧹 CLEARING AND REBUILDING CACHES"
echo "------------------------------------"
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

echo "Building new caches..."
php artisan config:cache
php artisan route:cache
echo ""

# Step 4: Check database and roles
echo "4. 🗄️ CHECKING DATABASE AND ROLES"
echo "---------------------------------"
php artisan tinker --execute="
try {
    \$connection = DB::connection()->getPdo();
    echo '✅ Database connection: OK' . PHP_EOL;
    
    \$rolesCount = DB::table('roles')->count();
    echo 'Roles in database: ' . \$rolesCount . PHP_EOL;
    
    if (\$rolesCount == 0) {
        echo '❌ No roles found! Running seeder...' . PHP_EOL;
    } else {
        \$roles = DB::table('roles')->pluck('name')->toArray();
        echo 'Available roles: ' . implode(', ', \$roles) . PHP_EOL;
    }
} catch (Exception \$e) {
    echo '❌ Database error: ' . \$e->getMessage() . PHP_EOL;
}
"

# Seed roles if needed
php artisan db:seed --class=RoleSeeder --force 2>/dev/null && echo "✅ Roles seeded successfully" || echo "⚠️  RoleSeeder not found or already executed"
echo ""

# Step 5: Check specific routes
echo "5. 🛣️  CHECKING DOKTER ROUTES"
echo "-----------------------------"
echo "Looking for dokter.rekam-medis routes..."
php artisan route:list --name=dokter.rekam-medis 2>/dev/null || {
    echo "❌ No routes found with name filter. Checking all dokter routes..."
    php artisan route:list | grep dokter | grep rekam-medis || echo "❌ No dokter.rekam-medis routes found"
}
echo ""

# Step 6: Check middleware
echo "6. 🛡️  CHECKING MIDDLEWARE"
echo "-------------------------"
echo "Checking RoleMiddleware..."
if [ -f "app/Http/Middleware/RoleMiddleware.php" ]; then
    echo "✅ RoleMiddleware exists"
else
    echo "❌ RoleMiddleware not found"
fi

echo "Checking if middleware is registered in Kernel..."
if grep -q "RoleMiddleware" app/Http/Kernel.php; then
    echo "✅ RoleMiddleware found in Kernel"
else
    echo "❌ RoleMiddleware not registered in Kernel"
fi
echo ""

# Step 7: Test route resolution
echo "7. 🔍 TESTING ROUTE RESOLUTION"
echo "------------------------------"
php artisan tinker --execute="
try {
    \$url = route('dokter.rekam-medis.index');
    echo '✅ Route resolved: ' . \$url . PHP_EOL;
} catch (Exception \$e) {
    echo '❌ Route resolution failed: ' . \$e->getMessage() . PHP_EOL;
}

try {
    \$url = route('dashboard');
    echo '✅ Dashboard route resolved: ' . \$url . PHP_EOL;
} catch (Exception \$e) {
    echo '❌ Dashboard route resolution failed: ' . \$e->getMessage() . PHP_EOL;
}
"
echo ""

# Step 8: Check file permissions
echo "8. 🔐 CHECKING FILE PERMISSIONS"
echo "-------------------------------"
check_permissions() {
    local dir=$1
    if [ -d "$dir" ]; then
        local perms=$(stat -c "%a" "$dir" 2>/dev/null || stat -f "%A" "$dir" 2>/dev/null || echo "unknown")
        local owner=$(stat -c "%U:%G" "$dir" 2>/dev/null || stat -f "%Su:%Sg" "$dir" 2>/dev/null || echo "unknown")
        echo "$dir: $perms ($owner)"
    else
        echo "$dir: does not exist"
    fi
}

check_permissions "storage"
check_permissions "bootstrap/cache"
check_permissions "public"
echo ""

# Step 9: Check web server configuration
echo "9. 🌐 CHECKING WEB SERVER CONFIGURATION"
echo "---------------------------------------"

# Check if running under web server
if [ -n "$SERVER_SOFTWARE" ]; then
    echo "Server software: $SERVER_SOFTWARE"
    echo "Document root: $DOCUMENT_ROOT"
elif command_exists nginx; then
    echo "Nginx detected"
    nginx -v 2>&1
elif command_exists apache2; then
    echo "Apache detected"
    apache2 -v 2>&1
elif command_exists httpd; then
    echo "Apache/httpd detected"
    httpd -v 2>&1
else
    echo "No web server detected or running in CLI"
fi
echo ""

# Step 10: Generate test URLs
echo "10. 🔗 GENERATING TEST URLS"
echo "---------------------------"
APP_URL=$(php -r "echo env('APP_URL', 'http://localhost');")
echo "Test these URLs in your browser:"
echo "- Login: $APP_URL/login"
echo "- Dashboard: $APP_URL/dashboard" 
echo "- Dokter Rekam Medis: $APP_URL/dokter/rekam-medis"
echo "- Debug User Roles: $APP_URL/debug/user-roles"
echo ""

# Step 11: Final recommendations
echo "11. 💡 TROUBLESHOOTING RECOMMENDATIONS"
echo "======================================"
echo ""
echo "If /dokter/rekam-medis still redirects to dashboard:"
echo ""
echo "A. Check user roles:"
echo "   php artisan tinker"
echo "   >>> \$user = User::where('email', 'your-email@example.com')->first();"
echo "   >>> \$user->roles->pluck('name');"
echo ""
echo "B. Check middleware logs:"
echo "   tail -f storage/logs/laravel.log"
echo ""
echo "C. Test with different user:"
echo "   - Create a new user with 'dokter' role"
echo "   - Login and test the route"
echo ""
echo "D. Check web server configuration:"
echo "   - Ensure all routes point to public/index.php"
echo "   - Check .htaccess or nginx config"
echo ""
echo "E. Clear browser cache and cookies"
echo ""
echo "F. Check if the issue is environment specific:"
echo "   - Compare APP_ENV, APP_DEBUG settings"
echo "   - Check database differences"
echo ""
echo "✅ Troubleshooting completed!"
echo ""
echo "If issue persists, run: php debug-production.php"
