#!/bin/bash

# Styling colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${PURPLE}=====================================================${NC}"
echo -e "${PURPLE}      GitBrowser Setup and Bootstrap Script          ${NC}"
echo -e "${PURPLE}=====================================================${NC}"

# Check for node
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC} Please install Node.js (v18+) to run this project."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC} Please install npm to run this project."
    exit 1
fi

echo -e "\n${BLUE}[1/3] Installing Backend Dependencies...${NC}"
cd backend
npm install --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install backend dependencies.${NC}"
    exit 1
fi
echo -e "${GREEN}Backend dependencies installed successfully!${NC}"

echo -e "\n${BLUE}[2/3] Installing Frontend Dependencies...${NC}"
cd ../frontend
npm install --no-audit --no-fund
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install frontend dependencies.${NC}"
    exit 1
fi
echo -e "${GREEN}Frontend dependencies installed successfully!${NC}"

echo -e "\n${PURPLE}=====================================================${NC}"
echo -e "${GREEN}             Project Setup Complete!                 ${NC}"
echo -e "${PURPLE}=====================================================${NC}"
echo -e "\nTo start the application, run these commands in separate terminal windows:\n"
echo -e "${YELLOW}1. Start the API Backend Server:${NC}"
echo -e "   cd backend && npm start"
echo -e "   (Runs on http://localhost:5000)\n"
echo -e "${YELLOW}2. Start the Frontend Dev Server:${NC}"
echo -e "   cd frontend && npm run dev"
echo -e "   (Runs on http://localhost:5173)\n"
echo -e "${CYAN}Note:${NC} You can customize the backend port or add your GitHub token in ${CYAN}backend/.env${NC}."
echo -e "${PURPLE}=====================================================${NC}"
