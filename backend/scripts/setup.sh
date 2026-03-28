#!/bin/bash

# Turab Root Backend Setup Script
# Usage: bash scripts/setup.sh

set -e

echo "=========================================="
echo "Turab Root Backend Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration:"
    echo "   - JWT_SECRET and JWT_REFRESH_SECRET (use strong random values)"
    echo "   - SMTP credentials (for email notifications)"
    echo "   - CORS_ORIGINS (your frontend URL)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Create uploads directory
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads/projects/galleries
    chmod 755 uploads
    echo "✅ Uploads directory created"
fi

# Create backups directory
if [ ! -d "backups" ]; then
    echo "📁 Creating backups directory..."
    mkdir -p backups
    chmod 755 backups
    echo "✅ Backups directory created"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run: npm run dev (for development)"
echo "3. Run: npm start (for production)"
echo ""
echo "API will run on http://localhost:3001"
echo ""
