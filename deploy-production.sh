#!/bin/bash

# Comprehensive deployment script for DigitalOcean
# Run this script on your DigitalOcean server

echo "🚀 COMPREHENSIVE LARAVEL DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

# Check if running as correct user
USER=$(whoami)
echo "Running as user: $USER"

# Set proper environment
export COMPOSER_ALLOW_SUPERUSER=1

# Step 1: Backup current state
echo "📦 Creating backup..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
if [ -d "storage" ]; then
    cp -r storage "$BACKUP_DIR-storage"
    echo "Storage backed up to $BACKUP_DIR-storage"
fi

# Step 2: Update from repository
echo "📥 Pulling latest changes..."
git pull origin main

# Step 3: Install/Update dependencies
echo "📚 Installing/updating dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# Step 4: Install Node dependencies and build assets
echo "🎨 Building frontend assets..."
npm ci --only=production
npm run build

# Step 5: Clear all caches
echo "🧹 Clearing all caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan event:clear

# Clear OpCache if available
if php -m | grep -q opcache; then
    echo "Clearing OpCache..."
    php artisan opcache:clear 2>/dev/null || php -r "if (function_exists('opcache_reset')) opcache_reset();"
fi

# Step 6: Run migrations
echo "🗃️  Running database migrations..."
php artisan migrate --force

# Step 7: Seed essential data (roles, permissions)
echo "🌱 Seeding essential data..."
php artisan db:seed --class=RoleSeeder --force 2>/dev/null || echo "RoleSeeder not found or already seeded"

# Step 8: Create storage symlink
echo "🔗 Creating storage symlink..."
php artisan storage:link

# Step 9: Set file permissions
echo "🔐 Setting proper file permissions..."

# For Ubuntu/CentOS with www-data user
if id "www-data" &>/dev/null; then
    WEB_USER="www-data"
elif id "nginx" &>/dev/null; then
    WEB_USER="nginx"
elif id "apache" &>/dev/null; then
    WEB_USER="apache"
else
    WEB_USER="$USER"
fi

echo "Using web user: $WEB_USER"

# Set ownership
sudo chown -R $WEB_USER:$WEB_USER storage bootstrap/cache public/storage 2>/dev/null || {
    chown -R $USER:$USER storage bootstrap/cache public/storage
}

# Set permissions
chmod -R 775 storage bootstrap/cache
chmod -R 755 public/storage public/build

# Step 10: Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Step 11: Test key components
echo "🧪 Testing application..."

# Test database connection
echo "Testing database connection..."
php artisan tinker --execute="echo 'DB Connection: ' . (DB::connection()->getPdo() ? 'OK' : 'Failed') . PHP_EOL;"

# Test roles
echo "Testing roles..."
php artisan tinker --execute="echo 'Roles count: ' . Spatie\Permission\Models\Role::count() . PHP_EOL;"

# List routes
echo "Checking dokter routes..."
php artisan route:list --name=dokter.rekam-medis

# Step 12: Restart services (if available)
echo "🔄 Restarting services..."

# Restart PHP-FPM
if systemctl is-active --quiet php8.2-fpm; then
    sudo systemctl reload php8.2-fpm
    echo "PHP-FPM reloaded"
elif systemctl is-active --quiet php8.1-fpm; then
    sudo systemctl reload php8.1-fpm
    echo "PHP-FPM reloaded"
elif systemctl is-active --quiet php-fpm; then
    sudo systemctl reload php-fpm
    echo "PHP-FPM reloaded"
fi

# Restart web server
if systemctl is-active --quiet nginx; then
    sudo systemctl reload nginx
    echo "Nginx reloaded"
elif systemctl is-active --quiet apache2; then
    sudo systemctl reload apache2
    echo "Apache reloaded"
fi

# Step 13: Final verification
echo "✅ Running final checks..."

# Check if routes are accessible
echo "Verifying routes..."
php artisan route:list | grep -E "(dokter\.rekam-medis|dashboard)" | head -5

# Check application status
echo "Application status:"
php artisan about --only=environment 2>/dev/null || echo "Laravel version: $(php artisan --version)"

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Visit your site and test /login"
echo "2. Login with a user that has 'dokter' role"
echo "3. Try accessing /dokter/rekam-medis"
echo "4. If still not working, run the debug script:"
echo "   php debug-production.php"
echo ""
echo "Common issues and fixes:"
echo "- 404 on routes: Check web server configuration"
echo "- Permission denied: Check file permissions"
echo "- Database errors: Check .env database settings"
echo "- Role errors: Run: php artisan db:seed --class=RoleSeeder"
