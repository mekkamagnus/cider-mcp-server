# Distribution Guide for Cider MCP Server

This guide covers different ways to package and distribute the Cider MCP Server for use anywhere.

## 🎯 Distribution Options

### 1. Standalone Executables (Recommended)

**Pros**: No dependencies, easy to install, fast startup
**Cons**: Larger file size

```bash
# Build for current platform
deno task compile

# Build for all platforms
deno task compile-all
```

**Usage**:
```json
{
  "mcpServers": {
    "cider": {
      "command": "/path/to/cider-mcp-server",
      "args": []
    }
  }
}
```

### 2. GitHub Releases (Automated)

**Setup**:
1. Push to GitHub repository
2. Create a release tag: `git tag v0.1.0 && git push origin v0.1.0`
3. GitHub Actions automatically builds for all platforms
4. Binaries available in releases

**Install**:
```bash
# One-line install script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/cider-mcp-server/main/scripts/install.sh | bash
```

### 3. Homebrew (macOS/Linux)

**For maintainers**:
1. Create Homebrew formula (see `examples/homebrew_formula.rb`)
2. Submit to homebrew-core or create tap

**For users**:
```bash
# From tap (recommended)
brew install your-username/tap/cider-mcp

# Or directly from URL
brew install https://raw.githubusercontent.com/YOUR_USERNAME/homebrew-tap/main/Formula/cider-mcp.rb
```

### 4. Package Managers

#### npm/JSR (Deno Runtime Required)
```bash
# Global install via deno
deno install --allow-net --allow-read --name cider-mcp https://raw.githubusercontent.com/YOUR_USERNAME/cider-mcp-server/main/src/index.ts

# Or via JSR
deno add jsr:@your-username/cider-mcp-server
```

#### Scoop (Windows)
```powershell
scoop bucket add your-username https://github.com/YOUR_USERNAME/scoop-bucket
scoop install cider-mcp-server
```

### 5. Docker Container

```dockerfile
FROM denoland/deno:alpine
WORKDIR /app
COPY . .
RUN deno cache src/index.ts
EXPOSE 3000
CMD ["deno", "run", "--allow-net", "--allow-read", "src/index.ts"]
```

**Usage**:
```bash
docker run -p 3000:3000 your-username/cider-mcp-server
```

### 6. Direct from Source (Development)

```json
{
  "mcpServers": {
    "cider": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net", 
        "--allow-read",
        "https://raw.githubusercontent.com/YOUR_USERNAME/cider-mcp-server/main/src/index.ts"
      ]
    }
  }
}
```

## 📦 Build and Package

### Local Building
```bash
# Build all platform binaries
./scripts/package.sh

# Outputs to dist/ directory:
# - cider-mcp-server-v0.1.0-macos.tar.gz
# - cider-mcp-server-v0.1.0-linux.tar.gz  
# - cider-mcp-server-v0.1.0-windows.zip
```

### GitHub Actions
The `.github/workflows/release.yml` automatically:
- Builds for macOS, Linux, Windows
- Creates GitHub release
- Attaches binaries
- Triggered by version tags

## 🚀 Publishing Checklist

1. **Prepare Release**
   - [ ] Update version in `deno.json`
   - [ ] Update `CHANGELOG.md`
   - [ ] Test on all platforms
   - [ ] Update documentation

2. **GitHub Release**
   - [ ] Create and push version tag
   - [ ] Verify GitHub Actions build
   - [ ] Test download links

3. **Package Managers**
   - [ ] Update Homebrew formula
   - [ ] Submit to package repositories
   - [ ] Update install scripts

4. **Documentation**
   - [ ] Update README with new version
   - [ ] Update configuration examples
   - [ ] Test installation instructions

## 🔧 Configuration Examples

### Global Installation
```json
{
  "mcpServers": {
    "cider": {
      "command": "cider-mcp-server",
      "args": [],
      "env": {
        "CIDER_DEFAULT_HOST": "localhost",
        "CIDER_DEFAULT_PORT": "7888"
      }
    }
  }
}
```

### Project-Specific
```json
{
  "mcpServers": {
    "cider": {
      "command": "./bin/cider-mcp-server",
      "args": [],
      "env": {
        "CIDER_DEFAULT_PORT": "60977"
      }
    }
  }
}
```

### Docker-based
```json
{
  "mcpServers": {
    "cider": {
      "command": "docker",
      "args": [
        "run", "--rm", "--network=host",
        "your-username/cider-mcp-server"
      ]
    }
  }
}
```

## 📊 Distribution Comparison

| Method | Setup Effort | User Experience | Dependencies | Auto-Updates |
|--------|--------------|-----------------|--------------|--------------|
| Standalone | Medium | Excellent | None | Manual |
| GitHub Releases | Low | Good | None | Manual |
| Homebrew | High | Excellent | None | Automatic |
| npm/JSR | Low | Good | Deno | Automatic |
| Docker | Medium | Good | Docker | Automatic |
| Source | Low | Fair | Deno | Manual |

## 🎯 Recommended Approach

For maximum reach and ease of use:

1. **Primary**: Standalone executables via GitHub Releases
2. **Secondary**: Homebrew formula for macOS/Linux users
3. **Development**: Direct from source via JSR/npm

This covers all major platforms with minimal dependencies while providing both stable releases and development versions.