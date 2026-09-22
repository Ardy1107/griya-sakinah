# MCP Servers — Setup Guide

## What is MCP?
**Model Context Protocol** = standard protocol for connecting AI tools to external data sources.
Think of it as "plugins" for AI — give your AI extra powers!

## Included MCP Servers

### 1. 📖 Context7 — Live Library Docs
**What:** Pulls real-time documentation from npm libraries (React, Supabase, etc.)
**Why:** AI gets latest API docs, not outdated training data
**Example:** When you ask about `useEffect`, Context7 provides React 19 docs, not React 16

### 2. 🧠 Sequential Thinking — Step-by-Step Reasoning
**What:** Forces AI to break complex problems into sequential steps
**Why:** Better solutions for architecture, debugging, and multi-step tasks
**Example:** Instead of "here's the code", AI first plans → analyzes → implements → verifies

### 3. 🎨 shadcn/ui — Component Library Docs
**What:** Live shadcn/ui component documentation and usage patterns
**Why:** AI knows exact component API, variants, and installation commands

## Setup

### For Antigravity IDE (Recommended)
Copy `mcp_config.json` to your global MCP config:
```
~/.gemini/antigravity/mcp_config.json
```

Or place `.agent/mcp_config.json` in your project root (already done!).

### Verify MCP is Working
In Antigravity, type something like:
```
"use Context7 to look up React useEffect docs"
```
If it works, you'll see the AI reference live docs!

## Adding More MCP Servers

Edit `.agent/mcp_config.json` and add:
```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["-y", "@package/name"]
    }
  }
}
```

## Popular MCP Servers to Consider

| Server | Package | Purpose |
|--------|---------|---------|
| Context7 | `@upstash/context7-mcp` | Live npm library docs |
| Sequential Thinking | `@modelcontextprotocol/server-sequential-thinking` | Step-by-step reasoning |
| shadcn/ui | `shadcn@latest mcp` | UI component docs |
| GitHub | `@modelcontextprotocol/server-github` | GitHub API access |
| Filesystem | `@modelcontextprotocol/server-filesystem` | File system access |
| Chrome DevTools | Chrome built-in | Debug web pages |
| Supabase | `@supabase/mcp` | Database management |
| Stripe | `@stripe/mcp` | Payment integration |

> 💡 Only add what you NEED. More MCP = more startup time.
