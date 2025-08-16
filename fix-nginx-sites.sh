#!/bin/bash

echo "🔧 NGINX SITES-ENABLED CONFIGURATION FIX"
echo "========================================"
echo ""

echo "🔍 Checking current enabled sites..."
echo "Sites enabled:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "🔍 Checking available sites..."
echo "Sites available:"
ls -la /etc/nginx/sites-available/ | grep -E "(klinik|clinic|banksampah|default)"
echo ""

# Check which config is actually being used
echo "🔍 Checking active configuration..."
nginx -T 2>/dev/null | grep -E "root|server_name" | head -10
echo ""

# Disable conflicting sites
echo "🚫 Disabling conflicting sites..."
if [ -L "/etc/nginx/sites-enabled/banksampah" ]; then
    echo "Disabling banksampah..."
    sudo rm /etc/nginx/sites-enabled/banksampah
fi

if [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "Disabling default..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Enable the correct klinik site
echo "✅ Enabling klinik site..."
if [ ! -L "/etc/nginx/sites-enabled/klinik" ]; then
    sudo ln -s /etc/nginx/sites-available/klinik /etc/nginx/sites-enabled/
    echo "Klinik site enabled"
else
    echo "Klinik site already enabled"
fi

echo ""
echo "📋 Current enabled sites after changes:"
ls -la /etc/nginx/sites-enabled/
echo ""

# Test configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration test passed"
    
    echo ""
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded"
    
    echo ""
    echo "🧪 Testing routes after fix..."
    sleep 2
    
    echo "Dashboard test:"
    curl -s -I "https://jayamakmursparepart.my.id/dashboard" | head -2
    
    echo ""
    echo "Dokter route test:" 
    curl -s -I "https://jayamakmursparepart.my.id/dokter/rekam-medis" | head -2
    
    echo ""
    echo "🎉 Fix completed!"
    echo ""
    echo "If routes still show 302, check:"
    echo "1. Laravel route cache: php artisan route:clear && php artisan route:cache"
    echo "2. File permissions on /var/www/sistem-klinik-sehat/public"
    echo "3. Laravel logs: tail -f /var/www/sistem-klinik-sehat/storage/logs/laravel.log"
    
else
    echo "❌ Configuration test failed"
    echo "Please check nginx configuration manually"
fi
