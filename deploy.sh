#!/bin/bash

echo "🚀 Starting deployment process for Laravel Clinic System..."

# Step 1: Clear all caches
echo "📦 Clearing application caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# Step 2: Install/Update dependencies if needed
echo "📚 Installing dependencies..."
composer install --optimize-autoloader --no-dev

# Step 3: Run migrations
echo "🗃️ Running database migrations..."
php artisan migrate --force

# Step 4: Seed roles and permissions if needed
echo "👥 Seeding roles and permissions..."
php artisan db:seed --class=RoleSeeder --force

# Step 5: Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Step 6: Build frontend assets
echo "🎨 Building frontend assets..."
npm ci --only=production
npm run build

# Step 7: Create storage symlink
echo "🔗 Creating storage symlink..."
php artisan storage:link

# Step 8: Set proper permissions
echo "🔐 Setting file permissions..."
chown -R www-data:www-data storage bootstrap/cache public/build
chmod -R 775 storage bootstrap/cache
chmod -R 755 public/build

# Step 9: Clear OpCache if available
echo "🧹 Clearing OpCache..."
if command -v php &> /dev/null; then
    php -r "if (function_exists('opcache_reset')) { opcache_reset(); echo 'OpCache cleared' . PHP_EOL; } else { echo 'OpCache not available' . PHP_EOL; }"
fi

# Step 10: Test key routes
echo "🧪 Testing key application routes..."
php artisan route:list --name=dokter.rekam-medis

echo "✅ Deployment completed successfully!"
echo "🎯 You can now access /dokter/rekam-medis"
