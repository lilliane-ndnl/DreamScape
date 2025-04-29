#!/bin/bash

# Debug output
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

# Make sure we're using the right Node.js version
echo "Node.js version:"
node -v
echo "NPM version:"
npm -v

# Install dependencies
echo "Installing dependencies..."
npm install

# Run the build command
echo "Running build command..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
else
  echo "Build failed with error code $?"
  exit 1
fi 