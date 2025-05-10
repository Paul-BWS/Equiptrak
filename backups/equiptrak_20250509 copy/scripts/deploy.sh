#!/bin/bash

# EquipTrack Deployment Script
# This script prepares the application for deployment to JustHost

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting EquipTrack deployment preparation...${NC}"

# Create deploy directory if it doesn't exist
if [ -d "deploy" ]; then
  echo -e "${YELLOW}Cleaning existing deploy directory...${NC}"
  rm -rf deploy
fi

echo -e "${YELLOW}Creating fresh deploy directory...${NC}"
mkdir -p deploy

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Frontend build failed. Aborting deployment.${NC}"
  exit 1
fi

# Copy built frontend
echo -e "${YELLOW}Copying frontend files...${NC}"
cp -r dist deploy/

# Copy server files
echo -e "${YELLOW}Copying server files...${NC}"
mkdir -p deploy/src/server
cp -r src/server deploy/src/

# Copy package files (only what's needed for production)
echo -e "${YELLOW}Copying package files...${NC}"
node -e "const pkg = require('./package.json'); const newPkg = { name: pkg.name, version: pkg.version, dependencies: pkg.dependencies, scripts: { start: 'node src/server/api.js' } }; require('fs').writeFileSync('./deploy/package.json', JSON.stringify(newPkg, null, 2));"

# Copy production environment file
echo -e "${YELLOW}Copying production environment configuration...${NC}"
cp .env.production deploy/.env

# Create README with instructions
echo -e "${YELLOW}Creating deployment README...${NC}"
cat > deploy/README.md << 'EOF'
# EquipTrack Deployment Package

This folder contains all the files needed to deploy EquipTrack to JustHost.

## Deployment Steps

1. Upload all contents of this folder to your JustHost web hosting directory
2. Set up Node.js in your JustHost control panel
3. Configure environment variables as needed in the .env file
4. Start the application with the command: `npm start`

For detailed instructions, refer to the HOSTING.md file in the project repository.
EOF

echo -e "${GREEN}Deployment package prepared successfully!${NC}"
echo -e "${GREEN}Your application is now ready in the 'deploy' directory.${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review and adjust the .env file in the deploy directory if needed"
echo -e "2. Upload all contents of the deploy directory to your JustHost server"
echo -e "3. Set up Node.js in your JustHost control panel"
echo -e "4. Start the application as described in the HOSTING.md guide" 