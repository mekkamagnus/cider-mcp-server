#!/bin/bash
# Package script for Cider MCP Server

set -e

echo "🏗️  Building Cider MCP Server for all platforms..."

# Create dist directory
mkdir -p dist

# Compile for all platforms
echo "🔨 Compiling for macOS..."
deno task compile:macos

echo "🔨 Compiling for Linux..."
deno task compile:linux

echo "🔨 Compiling for Windows..."
deno task compile:windows

echo "📦 Creating distribution packages..."

# Create version info
VERSION=$(grep '"version"' deno.json | cut -d'"' -f4)
echo "Version: $VERSION"

# Create tarballs for distribution
cd dist

# macOS
echo "📦 Packaging for macOS..."
tar -czf "cider-mcp-server-${VERSION}-macos.tar.gz" cider-mcp-server-macos
echo "✅ Created: cider-mcp-server-${VERSION}-macos.tar.gz"

# Linux  
echo "📦 Packaging for Linux..."
tar -czf "cider-mcp-server-${VERSION}-linux.tar.gz" cider-mcp-server-linux
echo "✅ Created: cider-mcp-server-${VERSION}-linux.tar.gz"

# Windows
echo "📦 Packaging for Windows..."
zip "cider-mcp-server-${VERSION}-windows.zip" cider-mcp-server-windows.exe
echo "✅ Created: cider-mcp-server-${VERSION}-windows.zip"

cd ..

echo ""
echo "🎉 Distribution packages created in dist/ directory:"
ls -la dist/

echo ""
echo "📤 Ready for release! Upload these files to GitHub releases."