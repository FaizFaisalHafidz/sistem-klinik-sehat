#!/bin/bash

echo "🔍 CHECKING FOR DOMAIN CONFLICTS IN NGINX"
echo "========================================="
echo ""

# Check which sites use the same domain
DOMAIN="jayamakmursparepart.my.id"
echo "🌐 Checking for domain conflicts with: $DOMAIN"
echo ""

CONFLICTING_SITES=()

# Check all enabled sites for domain conflicts
for site in /etc/nginx/sites-enabled/*; do
    site_name=$(basename "$site")
    if grep -q "$DOMAIN" "$site" 2>/dev/null; then
        echo "⚠️  CONFLICT FOUND: $site_name uses $DOMAIN"
        CONFLICTING_SITES+=("$site_name")
        echo "   Server names in $site_name:"
        grep "server_name" "$site" | head -2
        echo ""
    fi
done

echo "📊 CONFLICT SUMMARY:"
echo "==================="
if [ ${#CONFLICTING_SITES[@]} -gt 1 ]; then
    echo "❌ MULTIPLE SITES using same domain detected:"
    for site in "${CONFLICTING_SITES[@]}"; do
        echo "   - $site"
    done
    echo ""
    echo "🎯 SOLUTION: Disable conflicting sites"
    echo ""
    
    # Disable all except klinik
    for site in "${CONFLICTING_SITES[@]}"; do
        if [ "$site" != "klinik" ]; then
            echo "🚫 Should disable: $site"
        fi
    done
    
elif [ ${#CONFLICTING_SITES[@]} -eq 1 ]; then
    echo "✅ Only one site ($CONFLICTING_SITES) uses the domain"
else
    echo "❓ No sites found using the domain (this shouldn't happen)"
fi

echo ""
echo "🧪 TESTING CURRENT NGINX CONFIGURATION"
echo "====================================="

# Test which server block is actually being used
echo "Active server blocks for $DOMAIN:"
nginx -T 2>/dev/null | grep -A 10 -B 2 "server_name.*$DOMAIN" | head -20

echo ""
echo "🔧 RECOMMENDED ACTIONS:"
echo "======================"

if [ ${#CONFLICTING_SITES[@]} -gt 1 ]; then
    echo "1. Disable conflicting sites:"
    for site in "${CONFLICTING_SITES[@]}"; do
        if [ "$site" != "klinik" ]; then
            echo "   sudo rm /etc/nginx/sites-enabled/$site"
        fi
    done
    echo ""
    echo "2. Reload nginx:"
    echo "   sudo systemctl reload nginx"
    echo ""
    echo "3. Test routes again"
else
    echo "No domain conflicts found."
    echo "The issue might be elsewhere:"
    echo "1. Check Laravel route cache"
    echo "2. Check file permissions" 
    echo "3. Check Laravel logs"
fi
