#!/bin/bash

echo "🔧 NGINX CONFIGURATION FIX FOR LARAVEL ROUTES"
echo "=============================================="
echo ""

# Check if running as root or with sudo access
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    SUDO="sudo"
fi

echo "🔍 Checking current Nginx configuration..."
echo ""

# Find Nginx config files
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
NGINX_CONF="/etc/nginx/nginx.conf"

# Check if Nginx directories exist
if [ ! -d "$NGINX_SITES_AVAILABLE" ]; then
    echo "❌ Nginx sites-available directory not found at $NGINX_SITES_AVAILABLE"
    echo "Please check your Nginx installation"
    exit 1
fi

echo "✅ Nginx directories found"
echo ""

# Find the site configuration file
echo "🔍 Looking for site configuration files..."
SITE_CONFIG=""

# Common site config names
POSSIBLE_CONFIGS=("default" "jayamakmursparepart.my.id" "clinic" "laravel" "site")

for config in "${POSSIBLE_CONFIGS[@]}"; do
    if [ -f "$NGINX_SITES_AVAILABLE/$config" ]; then
        echo "Found config: $NGINX_SITES_AVAILABLE/$config"
        SITE_CONFIG="$NGINX_SITES_AVAILABLE/$config"
        break
    fi
done

# If not found, list all configs
if [ -z "$SITE_CONFIG" ]; then
    echo "Available site configs:"
    ls -la "$NGINX_SITES_AVAILABLE/"
    echo ""
    echo "Please specify your site config file name:"
    read -p "Enter config filename (e.g., default, yoursite.com): " USER_CONFIG
    SITE_CONFIG="$NGINX_SITES_AVAILABLE/$USER_CONFIG"
    
    if [ ! -f "$SITE_CONFIG" ]; then
        echo "❌ Config file not found: $SITE_CONFIG"
        exit 1
    fi
fi

echo "Using config file: $SITE_CONFIG"
echo ""

# Backup current config
BACKUP_FILE="${SITE_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo "📦 Creating backup: $BACKUP_FILE"
$SUDO cp "$SITE_CONFIG" "$BACKUP_FILE"
echo ""

# Show current problematic configuration
echo "🔍 Current configuration (relevant parts):"
echo "----------------------------------------"
grep -A 20 -B 5 "location.*/" "$SITE_CONFIG" | head -30
echo ""

# Create the correct Laravel Nginx configuration
echo "✍️ Creating correct Laravel Nginx configuration..."

# Generate the correct config content
cat > /tmp/laravel_nginx_config << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    # Replace with your actual domain
    server_name jayamakmursparepart.my.id;
    
    # Laravel public directory
    root /var/www/html/public;
    
    # Add index file
    index index.php index.html index.htm;
    
    # Logging
    access_log /var/log/nginx/laravel_access.log;
    error_log /var/log/nginx/laravel_error.log;
    
    # Main location block - THIS IS CRUCIAL FOR LARAVEL ROUTES
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # Handle PHP files
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        
        # Choose your PHP-FPM socket (adjust version as needed)
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        # Or use: fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        # Or use: fastcgi_pass 127.0.0.1:9000;
        
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Security headers
        fastcgi_hide_header X-Powered-By;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
    
    # Deny access to configuration files
    location ~ \.(env|log|htaccess)$ {
        deny all;
    }
    
    # Handle static assets efficiently
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Increase upload size if needed
    client_max_body_size 100M;
}
EOF

echo "✅ Configuration template created"
echo ""

# Ask user to review and apply
echo "📋 RECOMMENDED NGINX CONFIGURATION:"
echo "================================="
cat /tmp/laravel_nginx_config
echo ""
echo "🎯 KEY POINTS FOR LARAVEL ROUTES:"
echo "1. Root should point to Laravel's 'public' directory"
echo "2. Main location block MUST have: try_files \$uri \$uri/ /index.php?\$query_string;"
echo "3. NO specific location blocks for Laravel routes (let Laravel handle routing)"
echo ""

echo "❓ Do you want to apply this configuration? (y/n)"
read -p "Apply config? " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Updating configuration..."
    
    # Update the config (you might need to adjust paths)
    echo "⚠️  Please manually update your Nginx config with the template above"
    echo "Or use this command to replace your current config:"
    echo ""
    echo "$SUDO cp /tmp/laravel_nginx_config $SITE_CONFIG"
    echo ""
    echo "After updating, run:"
    echo "$SUDO nginx -t  # Test configuration"
    echo "$SUDO systemctl reload nginx  # Apply changes"
    echo ""
    
    echo "🔧 QUICK FIX - Most likely issue:"
    echo "================================"
    echo "Your current config probably has a location block like:"
    echo "  location /dokter {"
    echo "    # Some redirect or proxy rule"
    echo "  }"
    echo ""
    echo "REMOVE any specific location blocks for Laravel routes!"
    echo "Let the main 'location /' block handle all routes."
    echo ""
fi

# Test current configuration
echo "🧪 Testing current Nginx configuration:"
$SUDO nginx -t

echo ""
echo "📊 NGINX ERROR LOG (last 10 lines):"
echo "=================================="
$SUDO tail -10 /var/log/nginx/error.log 2>/dev/null || echo "No error log accessible"

echo ""
echo "🎯 SUMMARY OF LIKELY ISSUE:"
echo "=========================="
echo "Your Nginx config probably has:"
echo "1. Wrong document root (not pointing to Laravel's public folder)"
echo "2. Missing or incorrect try_files directive"  
echo "3. Specific location blocks interfering with Laravel routing"
echo "4. Redirect rules that catch /dokter/* routes"
echo ""
echo "✅ Fix complete! Test your routes after applying the configuration."

# Clean up
rm -f /tmp/laravel_nginx_config
