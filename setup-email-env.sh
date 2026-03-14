#!/bin/bash

echo "🔧 Setting up email environment variables for WeightPro..."

# Set EMAIL_USER
echo "Setting EMAIL_USER..."
echo "support@gooofit.com" | vercel env add EMAIL_USER production --scope omprakash-utahas-projects

# Set EMAIL_PASSWORD
echo "Setting EMAIL_PASSWORD..."
echo "Fortune$$336699" | vercel env add EMAIL_PASSWORD production --scope omprakash-utahas-projects

echo "✅ Environment variables set successfully!"
echo "🔄 Redeploying with new environment variables..."
vercel --prod --scope omprakash-utahas-projects

echo "🎉 Email setup complete!"
echo "📧 Test the email functionality by:"
echo "   1. Registering a new user (should receive welcome email)"
echo "   2. Using 'Forgot Password' feature (should receive OTP)" 