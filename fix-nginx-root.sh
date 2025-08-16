#!/bin/bash

echo "🔧 FIXING NGINX DOCUMENT ROOT FOR CLINIC SYSTEM"
echo "==============================================="
echo ""

# Find the correct clinic system path
echo "🔍 Looking for clinic system installation..."
CLINIC_PATHS=(
    "/var/www/clinic-system"
    "/var/www/html/clinic-system" 
    "/var/www/sistem-klinik-sehat"
    "/var/www/html/sistem-klinik-sehat"
    "/home/www-data/clinic-system"
    "/home/*/clinic-system"
    "/var/www/project-gustamil"  # current wrong path
)

CLINIC_PATH=""
for path in "${CLINIC_PATHS[@]}"; do
    if [ -f "$path/artisan" ]; then
        CLINIC_PATH="$path"
        echo "✅ Found clinic system at: $CLINIC_PATH"
        break
    fi
done

if [ -z "$CLINIC_PATH" ]; then
    echo "❌ Clinic system not found in common locations"
    echo "Please enter the full path to your clinic system:"
    read -p "Path: " CLINIC_PATH
    
    if [ ! -f "$CLINIC_PATH/artisan" ]; then
        echo "❌ Invalid path - artisan file not found"
        exit 1
    fi
fi

PUBLIC_PATH="$CLINIC_PATH/public"
echo "📁 Using public path: $PUBLIC_PATH"
echo ""

# Check current nginx config
NGINX_CONFIG="/etc/nginx/sites-available/banksampah"
echo "📝 Current nginx config: $NGINX_CONFIG"

if [ ! -f "$NGINX_CONFIG" ]; then
    echo "❌ Nginx config file not found"
    exit 1
fi

# Backup current config
BACKUP_FILE="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup: $BACKUP_FILE"
sudo cp "$NGINX_CONFIG" "$BACKUP_FILE"

# Show current root setting
echo ""
echo "🔍 Current root setting:"
grep -n "root.*" "$NGINX_CONFIG"
echo ""

# Fix the document root
echo "🔧 Updating document root to: $PUBLIC_PATH"
sudo sed -i "s|root /var/www/project-gustamil/public;|root $PUBLIC_PATH;|g" "$NGINX_CONFIG"

# Also update any other references
sudo sed -i "s|/var/www/project-gustamil|$CLINIC_PATH|g" "$NGINX_CONFIG"

# Show updated root setting
echo "✅ Updated root setting:"
grep -n "root.*" "$NGINX_CONFIG"
echo ""

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    echo ""
    echo "🔄 Reloading nginx..."
    if sudo systemctl reload nginx; then
        echo "✅ Nginx reloaded successfully"
    else
        echo "❌ Failed to reload nginx"
        echo "Restoring backup..."
        sudo cp "$BACKUP_FILE" "$NGINX_CONFIG"
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed"
    echo "Restoring backup..."
    sudo cp "$BACKUP_FILE" "$NGINX_CONFIG"
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Document root has been updated"
echo ""
echo "📊 Summary of changes:"
echo "- Backup created: $BACKUP_FILE"
echo "- Document root changed to: $PUBLIC_PATH"  
echo "- Nginx reloaded"
echo ""
echo "🧪 Testing routes now..."
echo ""

# Test the routes
APP_URL="https://jayamakmursparepart.my.id"

echo "Testing Dashboard:"
curl -s -I "$APP_URL/dashboard" | head -2

echo ""
echo "Testing Dokter Route:"
curl -s -I "$APP_URL/dokter/rekam-medis" | head -2

echo ""
echo "✅ Fix completed!"
echo ""
echo "🎯 If routes are still not working:"
echo "1. Check file permissions: chmod -R 755 $PUBLIC_PATH"
echo "2. Check Laravel logs: tail -f $CLINIC_PATH/storage/logs/laravel.log"
echo "3. Clear Laravel caches: cd $CLINIC_PATH && php artisan route:clear && php artisan route:cache"
