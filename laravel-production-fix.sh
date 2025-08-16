#!/bin/bash

echo "🚀 LARAVEL TROUBLESHOOTING - PRODUCTION"
echo "======================================"
echo ""

# Clear all Laravel caches
echo "🧹 CLEARING LARAVEL CACHES"
echo "=========================="
php artisan config:clear
php artisan route:clear  
php artisan view:clear
php artisan cache:clear
echo "✅ All Laravel caches cleared"
echo ""

# Rebuild optimized caches for production
echo "⚡ REBUILDING PRODUCTION CACHES"
echo "=============================="
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✅ Production caches rebuilt"
echo ""

# Check file permissions
echo "🔐 CHECKING FILE PERMISSIONS"
echo "=========================="
echo "Current directory permissions:"
ls -la /var/www/sistem-klinik-sehat/ | head -10

echo ""
echo "Storage directory permissions:"
ls -la storage/

echo ""
echo "Bootstrap/cache permissions:"
ls -la bootstrap/cache/

echo ""

# Fix permissions if needed
echo "🔧 FIXING PERMISSIONS"
echo "==================="
sudo chown -R www-data:www-data /var/www/sistem-klinik-sehat/
sudo chmod -R 755 /var/www/sistem-klinik-sehat/
sudo chmod -R 775 storage/
sudo chmod -R 775 bootstrap/cache/
echo "✅ Permissions fixed"
echo ""

# Test routes after cache clear
echo "🧪 TESTING ROUTES AFTER CACHE CLEAR"
echo "================================="

echo "Testing /dokter/rekam-medis route:"
curl -I "https://jayamakmursparepart.my.id/dokter/rekam-medis" 2>/dev/null | head -3

echo ""
echo "Testing direct Laravel route list:"
php artisan route:list | grep "dokter/rekam-medis"

echo ""
echo "Testing middleware registration:"
php artisan route:list | grep "role:" | head -5

echo ""

# Check Laravel logs for any errors
echo "📋 CHECKING RECENT LARAVEL LOGS"
echo "=============================="
if [ -f "storage/logs/laravel.log" ]; then
    echo "Recent Laravel errors:"
    tail -20 storage/logs/laravel.log
else
    echo "No Laravel log file found"
fi

echo ""
echo "🎯 NEXT STEPS"
echo "============"
echo "1. Test routes in browser now"
echo "2. Check browser network tab for actual response"
echo "3. If still redirecting, check Laravel session/auth issues"

# Create a simple test route to verify Laravel is working
echo "<?php
Route::get('/test-production-debug', function () {
    return response()->json([
        'status' => 'Laravel working',
        'environment' => app()->environment(),
        'user' => auth()->check() ? auth()->user()->toArray() : 'Not authenticated',
        'route' => request()->path(),
        'timestamp' => now()
    ]);
});" > routes/test.php

echo ""
echo "🧪 Created test route: /test-production-debug"
echo "Visit: https://jayamakmursparepart.my.id/test-production-debug"
