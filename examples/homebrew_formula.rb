class CiderMcp < Formula
  desc "MCP server for connecting AI agents to Cider REPL instances"
  homepage "https://github.com/YOUR_USERNAME/cider-mcp-server"
  url "https://github.com/YOUR_USERNAME/cider-mcp-server/releases/download/v0.1.0/cider-mcp-server-0.1.0-macos.tar.gz"
  sha256 "YOUR_SHA256_HERE"
  license "MIT"

  def install
    bin.install "cider-mcp-server-macos" => "cider-mcp-server"
  end

  test do
    # Test that the binary runs
    system "#{bin}/cider-mcp-server", "--help"
  end
end