#!/bin/bash

echo "🎯 QUICK NGINX DIAGNOSIS FOR LARAVEL ROUTES"
echo "==========================================="
echo ""

# Test specific routes with curl to see the redirect behavior
APP_URL="https://jayamakmursparepart.my.id"

echo "🧪 Testing route responses..."
echo ""

# Test 1: Dashboard (should work)
echo "1. Testing Dashboard:"
curl -s -I "$APP_URL/dashboard" | head -3
echo ""

# Test 2: Dokter route (probably redirects)
echo "2. Testing Dokter Route:"
curl -s -I "$APP_URL/dokter/rekam-medis" | head -3  
echo ""

# Test 3: Debug route (works)
echo "3. Testing Debug Route:"
curl -s -I "$APP_URL/debug/test-dokter-access" | head -3
echo ""

# Show nginx error logs related to Laravel
echo "4. 📋 Recent Nginx Error Logs:"
echo "------------------------------"
if [ -f "/var/log/nginx/error.log" ]; then
    sudo tail -20 /var/log/nginx/error.log | grep -E "(dokter|laravel|404|redirect)" || echo "No relevant errors found"
else
    echo "❌ Cannot access nginx error log"
fi
echo ""

# Show current nginx config snippet
echo "5. 🔍 Current Nginx Config Check:"
echo "---------------------------------"
NGINX_CONFIG=$(find /etc/nginx/sites-available /etc/nginx/conf.d -name "*" -type f 2>/dev/null | head -1)

if [ -n "$NGINX_CONFIG" ]; then
    echo "Found config: $NGINX_CONFIG"
    echo ""
    echo "Root directory setting:"
    grep -n "root.*" "$NGINX_CONFIG" | head -2
    echo ""
    echo "Try files setting:"
    grep -n "try_files" "$NGINX_CONFIG" | head -2
    echo ""
    echo "Location blocks:"
    grep -n "location.*{" "$NGINX_CONFIG" | head -5
else
    echo "❌ No nginx config found"
fi
echo ""

echo "6. 💡 DIAGNOSIS RESULT:"
echo "====================="
echo ""
echo "If /dokter/rekam-medis returns 301/302 redirect but /debug routes work:"
echo "➜ This confirms it's an NGINX configuration issue"
echo ""
echo "Most common causes:"
echo "1. Wrong document root (not pointing to /path/to/laravel/public)"
echo "2. Missing try_files directive in main location block"
echo "3. Specific location block for /dokter that redirects"
echo "4. Old cached rules or site config"
echo ""
echo "🚀 IMMEDIATE FIXES TO TRY:"
echo ""
echo "A. Check your nginx site config has:"
echo "   root /var/www/html/public;  # (or your Laravel public path)"
echo "   location / {"
echo "     try_files \$uri \$uri/ /index.php?\$query_string;"
echo "   }"
echo ""
echo "B. Remove any location blocks like:"
echo "   location /dokter { ... }"
echo "   location /admin { ... }"
echo ""
echo "C. Test config and reload:"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "D. Clear Laravel caches one more time:"
echo "   php artisan route:clear && php artisan route:cache"
echo ""
echo "✅ Run ./fix-nginx-config.sh for detailed fix guidance"
