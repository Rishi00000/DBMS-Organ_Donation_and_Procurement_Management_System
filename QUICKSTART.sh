#!/bin/bash

# LifeLink Quick Start Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🏥 LifeLink - Organ Donation & Procurement Management System"
echo "=========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
echo "📋 Checking prerequisites..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found: $(psql --version)${NC}"
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Database setup
echo "📊 Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

# Create database
echo "Creating database..."
export PGPASSWORD=$DB_PASSWORD
psql -U $DB_USER -c "DROP DATABASE IF EXISTS lifelink_db;" 2>/dev/null || true
psql -U $DB_USER -c "CREATE DATABASE lifelink_db;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi

# Initialize schema
echo "Initializing database schema..."
psql -U $DB_USER -d lifelink_db -f backend/database/schema.sql > /dev/null
psql -U $DB_USER -d lifelink_db -f backend/database/init.sql

echo -e "${GREEN}✅ Database initialized with sample data${NC}"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Update .env with actual database credentials
    sed -i.bak "s/DB_USER=postgres/DB_USER=$DB_USER/" .env
    sed -i.bak "s/DB_PASSWORD=your_password_here/DB_PASSWORD=$DB_PASSWORD/" .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    sed -i.bak "s/JWT_SECRET=your_very_secure_secret_key_change_this_in_production/JWT_SECRET=$JWT_SECRET/" .env
    
    rm .env.bak 2>/dev/null || true
    echo -e "${GREEN}✅ Environment file created${NC}"
fi

echo "Installing backend dependencies..."
npm install --silent

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

echo "Installing frontend dependencies..."
npm install --silent

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# Success message
echo "=========================================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================================="
echo ""
echo "📝 Default Login Credentials:"
echo "   Admin:          admin / admin123"
echo "   Hospital Staff: apollo_staff1 / staff123"
echo "   Recipient:      patient_arjun / patient123"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend && npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend && npm run dev"
echo ""
echo "   Then open: http://localhost:5173"
echo ""
echo "📚 For detailed instructions, see SETUP.md"
echo ""
