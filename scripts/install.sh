#!/bin/bash
# Install script for Cider MCP Server

set -e

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $ARCH in
  x86_64) ARCH="x86_64" ;;
  arm64|aarch64) ARCH="aarch64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Determine binary name
case $OS in
  darwin) BINARY="cider-mcp-server-macos" ;;
  linux) BINARY="cider-mcp-server-linux" ;;
  mingw*|cygwin*|msys*) BINARY="cider-mcp-server-windows.exe" ;;
  *) echo "Unsupported OS: $OS"; exit 1 ;;
esac

# Installation directory
INSTALL_DIR="${HOME}/.local/bin"
mkdir -p "$INSTALL_DIR"

# Download URL (GitHub releases)
REPO_URL="https://github.com/YOUR_USERNAME/cider-mcp-server"
DOWNLOAD_URL="${REPO_URL}/releases/latest/download/${BINARY}"

echo "🔽 Downloading Cider MCP Server for $OS ($ARCH)..."
echo "📁 Installing to: $INSTALL_DIR/cider-mcp-server"

# Download and install
if command -v curl >/dev/null 2>&1; then
    curl -L -o "$INSTALL_DIR/cider-mcp-server" "$DOWNLOAD_URL"
elif command -v wget >/dev/null 2>&1; then
    wget -O "$INSTALL_DIR/cider-mcp-server" "$DOWNLOAD_URL"
else
    echo "❌ Error: curl or wget is required"
    exit 1
fi

chmod +x "$INSTALL_DIR/cider-mcp-server"

echo "✅ Cider MCP Server installed successfully!"
echo ""
echo "📋 Add this to your Claude Desktop config:"
echo '{'
echo '  "mcpServers": {'
echo '    "cider": {'
echo "      \"command\": \"$INSTALL_DIR/cider-mcp-server\","
echo '      "args": []'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "🔧 Make sure $INSTALL_DIR is in your PATH:"
echo "export PATH=\"\$HOME/.local/bin:\$PATH\""