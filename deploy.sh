#!/bin/bash
set -e

echo "🚀 Agent Marketplace Deploy Script"
echo "================================="

# Check if domain provided
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh <domain>"
    echo "Example: ./deploy.sh agents.mydomain.com"
    exit 1
fi

DOMAIN=$1

# Update nginx config with domain
sed -i "s/agent-marketplace.example.com/$DOMAIN/g" nginx.conf

# Create uploads directory
mkdir -p uploads

# Build and start
echo "📦 Building containers..."
docker compose build

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for database..."
sleep 10

echo "🗄️ Running database migrations..."
docker compose exec -T backend npx prisma db push

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your marketplace is available at:"
echo "   http://$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "   1. Set up SSL certificates"
echo "   2. Configure Oxapay API keys in .env"
echo "   3. Create admin user"
