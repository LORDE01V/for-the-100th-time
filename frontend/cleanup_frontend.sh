#!/bin/bash

# Cleanup script for the frontend directory

# Navigate to the frontend directory
cd "$(dirname "$0")" || { echo "Frontend directory not found!"; exit 1; }

echo "Cleaning up the frontend directory..."

# Remove node_modules (to clear dependencies)
if [ -d "node_modules" ]; then
  echo "Removing node_modules..."
  rm -rf node_modules
else
  echo "node_modules not found, skipping..."
fi

# Remove build artifacts (if any)
if [ -d "build" ]; then
  echo "Removing build artifacts..."
  rm -rf build
else
  echo "Build directory not found, skipping..."
fi

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove log files
echo "Removing log files..."
find . -type f -name "*.log" -exec rm -f {} \;

# Remove temporary files
echo "Removing temporary files..."
find . -type f -name "*.tmp" -exec rm -f {} \;

# Remove .DS_Store files (macOS specific)
echo "Removing .DS_Store files..."
find . -type f -name ".DS_Store" -exec rm -f {} \;

# Remove unnecessary files like .env (if needed)
if [ -f ".env" ]; then
  echo "Removing .env file..."
  rm -f .env
else
  echo ".env file not found, skipping..."
fi

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

echo "Frontend cleanup completed!"