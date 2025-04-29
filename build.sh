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
  echo "Standard build failed, trying with Rollup configuration..."
  
  # Install Rollup and plugins if they're not already installed
  echo "Installing Rollup and plugins..."
  npm install --save-dev @rollup/plugin-babel @rollup/plugin-commonjs @rollup/plugin-node-resolve rollup rollup-plugin-terser @babel/preset-env @babel/preset-react
  
  # Run Rollup build
  echo "Running Rollup build..."
  npx rollup -c rollup.config.js
  
  # Check if Rollup build succeeded
  if [ $? -eq 0 ]; then
    echo "Rollup build completed successfully!"
  else
    echo "Rollup build failed with error code $?"
    exit 1
  fi
fi 