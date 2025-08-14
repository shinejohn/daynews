#!/bin/bash

# Copy updated ads components to the main src directory
echo "Copying updated ads components..."

# Create the ads directory if it doesn't exist
mkdir -p src/components/ads

# Copy all files from updatedfiles to the main src directory
cp -r updatedfiles/src/components/ads/* src/components/ads/

echo "✅ Updated files copied successfully!"

# List the copied files
echo -e "\nCopied files:"
ls -la src/components/ads/