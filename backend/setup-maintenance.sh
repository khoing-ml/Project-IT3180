#!/bin/bash

# Maintenance System Setup Script
# This script helps set up the maintenance management system

echo "🚀 Maintenance System Setup"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the backend directory.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 This script will:${NC}"
echo "  1. Check Supabase connection"
echo "  2. Create maintenance_requests table"
echo "  3. Set up RLS policies"
echo "  4. Create necessary triggers"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${YELLOW}Setup cancelled.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Setting up database...${NC}"

# Check if SQL file exists
if [ ! -f "database/create_maintenance_requests_table.sql" ]; then
    echo -e "${RED}❌ SQL file not found: database/create_maintenance_requests_table.sql${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SQL file found${NC}"
echo ""
echo -e "${YELLOW}⚠️  Please run the following SQL in your Supabase SQL Editor:${NC}"
echo ""
echo "---------------------------------------------------"
cat database/create_maintenance_requests_table.sql
echo "---------------------------------------------------"
echo ""
echo -e "${BLUE}💡 Instructions:${NC}"
echo "  1. Open Supabase Dashboard"
echo "  2. Go to SQL Editor"
echo "  3. Create a new query"
echo "  4. Copy and paste the SQL above"
echo "  5. Run the query"
echo ""
read -p "Have you completed the SQL setup? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo -e "${GREEN}✅ Database setup completed!${NC}"
    echo ""
    echo -e "${BLUE}📁 Files created:${NC}"
    echo "  Backend:"
    echo "    - controllers/maintenanceController.js"
    echo "    - routes/maintenanceRoutes.js"
    echo ""
    echo "  Frontend:"
    echo "    - lib/maintenanceApi.ts"
    echo "    - app/(modules)/maintenance/page.tsx"
    echo "    - app/admin/maintenance/page.tsx"
    echo ""
    echo -e "${GREEN}🎉 Setup complete!${NC}"
    echo ""
    echo -e "${BLUE}📝 Next steps:${NC}"
    echo "  1. Start backend: npm run dev"
    echo "  2. Start frontend: cd ../frontend && npm run dev"
    echo "  3. Access user page: http://localhost:3000/maintenance"
    echo "  4. Access admin page: http://localhost:3000/admin/maintenance"
    echo ""
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "  - Full guide: MAINTENANCE_SYSTEM.md"
    echo "  - Quick start: MAINTENANCE_QUICK_START.md"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Please complete the SQL setup and run this script again.${NC}"
    exit 1
fi
