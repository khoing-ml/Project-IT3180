#!/bin/bash

echo "🧪 Testing BlueMoon Backend API..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3001/api/health)
if [[ $HEALTH == *"OK"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi

# Test 2: Root endpoint
echo "2️⃣  Testing root endpoint..."
ROOT=$(curl -s http://localhost:3001/)
if [[ $ROOT == *"BlueMoon"* ]]; then
    echo -e "${GREEN}✓ Root endpoint passed${NC}"
else
    echo -e "${RED}✗ Root endpoint failed${NC}"
    exit 1
fi

# Test 3: Unauthorized access (should fail)
echo "3️⃣  Testing unauthorized access..."
UNAUTH=$(curl -s http://localhost:3001/api/users)
if [[ $UNAUTH == *"No token"* ]] || [[ $UNAUTH == *"error"* ]]; then
    echo -e "${GREEN}✓ Unauthorized access correctly blocked${NC}"
else
    echo -e "${RED}✗ Unauthorized access not blocked${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Login to frontend as admin"
echo "   2. Visit http://localhost:3000/admin/users"
echo "   3. Start managing users!"
