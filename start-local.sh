#!/bin/bash
# Removed set -e to allow background processes to show errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Ottero Local Development Environment${NC}"
echo ""

# Parse arguments
START_TUNNEL=true
TUNNEL_ONLY=false

for arg in "$@"; do
    case $arg in
        --tunnel)
            START_TUNNEL=true
            ;;
        --tunnel-only)
            TUNNEL_ONLY=true
            ;;
        --help)
            echo "Usage: ./start-local.sh [options]"
            echo ""
            echo "Options:"
            echo "  --tunnel       Start pinggy tunnel for external access"
            echo "  --tunnel-only  Only start the tunnel (assumes services already running)"
            echo "  --help         Show this help message"
            exit 0
            ;;
    esac
done

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Tunnel only mode
if [ "$TUNNEL_ONLY" = true ]; then
    echo -e "${BLUE}Starting pinggy tunnel only...${NC}"
    ssh -p 443 -R0:localhost:8083 -L4300:localhost:4300 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 Mc2F0uGiumF@pro.pinggy.io
    exit 0
fi

# Step 1: Check MySQL is running (assumes external MySQL container)
echo -e "${GREEN}Step 1: Checking MySQL...${NC}"
if docker ps | grep -q mysql; then
    echo -e "${GREEN}✓ MySQL is running${NC}"
else
    echo -e "${RED}✗ MySQL container not found. Start it first.${NC}"
    exit 1
fi
echo ""

# Step 2: Start Pinggy Tunnel
if [ "$START_TUNNEL" = true ]; then
    echo -e "${GREEN}Step 2: Starting Pinggy Tunnel...${NC}"
    ssh -p 443 -R0:localhost:8083 -L4300:localhost:4300 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 Mc2F0uGiumF@pro.pinggy.io &
    TUNNEL_PID=$!
    echo -e "${GREEN}✓ Tunnel started${NC}"
    echo ""
    sleep 3
fi

# Step 3: Start Frontend
echo -e "${GREEN}Step 3: Starting Frontend (Vite)...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi
npm run dev 2>&1 | while IFS= read -r line; do echo -e "${BLUE}[frontend]${NC} $line"; done &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend starting on http://localhost:5173${NC}"
echo ""

# Step 4: Start Backend
echo -e "${GREEN}Step 4: Starting Backend (Spring Boot)...${NC}"
cd backend
# Run maven with full output (no -q flag) to see all logs including errors
mvn spring-boot:run -Dspring-boot.run.profiles=dev 2>&1 | while IFS= read -r line; do echo -e "${YELLOW}[backend]${NC} $line"; done &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend starting on http://localhost:8083${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Ottero is running!${NC}"
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:8083/api${NC}"
echo -e "  MySQL:    ${BLUE}localhost:3306${NC}"
if [ "$START_TUNNEL" = true ]; then
    echo -e "  Tunnel:   ${BLUE}Check pinggy output for URL${NC}"
fi
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo -e "${BLUE}========================================${NC}"

# Wait for all processes
wait
