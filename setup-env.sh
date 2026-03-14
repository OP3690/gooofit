#!/bin/bash

echo "🚀 Setting up environment variables for gooofit.com..."

# Set environment variables in Vercel
echo "Setting MONGODB_URI..."
vercel env add MONGODB_URI production <<< "mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/weight-management?retryWrites=true&w=majority&appName=Cluster0"

echo "Setting JWT_SECRET..."
vercel env add JWT_SECRET production <<< "your_super_secret_jwt_key_here_change_this_in_production"

echo "Setting NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

echo "✅ Environment variables set successfully!"
echo "🔄 Redeploying with new environment variables..."
vercel --prod

echo "🎉 Setup complete! Your application is ready."
echo "📱 Visit: https://abc-rfkm5mt01-omprakash-utahas-projects.vercel.app"
echo "🌐 Once DNS is configured: https://gooofit.com" 