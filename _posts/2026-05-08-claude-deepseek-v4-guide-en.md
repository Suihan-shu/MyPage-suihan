---
layout: post
title: "Claude Code + DeepSeek V4: An Unofficial Setup Guide"
date: 2026-05-08 23:00:00 +0800
categories: ["Tools & Resources"]
tags: ["Claude Code", "DeepSeek V4", "CC Switch", "AI Agent"]
description: "A step-by-step guide to using DeepSeek V4 through Claude Code: API setup, CC Switch, and VS Code/Desktop/CLI installation."
lang: en
lang-ref: post-claude-deepseek-v4-guide-01
toc:
  sidebar: left
series_key: geek-survival-guide
series_order: 4
giscus_comments: true
---

Copilot has been painfully unreliable lately, so I started exploring Claude Code with DeepSeek V4 as the backend. So far it's been solid — and the price-to-performance ratio is excellent. Here's my setup process, documented so others can follow along.

The whole thing has five parts: getting a DeepSeek API key → installing CC Switch → installing Claude Code (three methods, pick one) → connecting to DeepSeek V4 → sync settings.

**Update (2026.5.18):** Starting May 2026, the Claude desktop app has tightened access for third-party model providers. You can now use the CC Switch method described in this guide. Since version v3.15.0, CC Switch supports standalone switching for Claude Code desktop — the [official docs](https://ccswitch.io/en/docs?section=providers&item=claude-desktop) are pretty detailed. If you've already configured CC Switch, you can import your settings directly. If not, the setup is identical to the CLI API configuration below. The key thing: you'll need to open CC Switch and enable **routing mode** (toggle in the top-left corner) every time you launch the Claude desktop app.

## Get a DeepSeek API Key

First, head to the DeepSeek developer platform and sign up.

Click **API keys** in the left sidebar, then create a new key. Give it a name you'll recognize.

![Create API Key](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-deepseek-api-keys.png)

Once created, a popup will show the key. **Copy it immediately — it only appears once.** Save it somewhere safe on your local machine, and never expose it online. If you miss it, no worries: just delete the key and create a new one.

![API Key popup](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-api-key-popup.png)

With the API key in hand, the next step is setting up the toolchain. I recommend installing CC Switch first — it'll centralize all the configuration that follows.

## Install CC Switch

CC Switch is a desktop tool for managing vendor configurations across Claude Code, Codex, and Gemini CLI. The main perk: you don't have to memorize environment variables. Switching models is two clicks, MCP and Skills are managed in one place, and you can review your conversation history.

Grab the latest release from [Release CC Switch · farion1231/cc-switch](https://github.com/farion1231/cc-switch/releases) — the top entry is always the latest. Scroll down to **Assets**; if you don't see Windows listed, click **Show all assets** to expand the full list. You'll typically want `CC-Switch-v3.xx.x-Windows.msi`.

Windows users can also grab it directly from this link (currently v3.14, but I'd recommend using the Releases link above for the latest version): [CC-Switch-v3.14.1-Windows.msi](https://github.com/YOUR_GITHUB_USERNAME/Blog-assets/raw/main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-installer.msi)

Double-click to install. Choose your install location, then Next through the rest.

![CC Switch install](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-install.png)

Once open, the first tab is Claude. The top bar also supports ChatGPT, Gemini, and other providers — but we're here for Claude Code. With CC Switch installed, you're ready to install and configure Claude.

![CC Switch main screen](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-main.png)

To use Claude inside your IDE, you'll need the Claude plugin. In CC Switch, open Settings from the top-left corner, scroll to the bottom, and enable **Apply to Claude Code Plugin** — this lets CC Switch handle model switching so you don't have to do it manually every time.

Also turn on **Skip Claude Code Initial Setup** to bypass some first-run prompts.

![CC Switch settings](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-settings.png)

With CC Switch configured, it's time to install Claude Code itself. Three options, each with different strengths.

## Install Claude Code

Claude Code comes in three forms — desktop app, CLI, and VS Code extension — and all three can be pointed at DeepSeek V4. The desktop app is better for Q&A and conversations (I haven't tested it much; DeepSeek V4's multimodal capabilities are still catching up to Claude, GPT, and Gemini — though a multimodal update is rumored for end of month). The CLI is where it shines for programming tasks — Anthropic clearly knows what they're doing with prompt engineering, and the experience is excellent. Compared to tools like TARE or Copilot, the context retention and output quality are on another level. My daily driver is the VS Code extension: I'm not handing the entire project to AI, Agent mode is assistive, and staying in VS Code makes it easier to check errors, run outputs, and tap into the plugin ecosystem.

These three are completely independent — no shared dependencies, no bundled install. Pick whichever fits your workflow.

My take on difficulty: VS Code extension < Desktop (requires VPN/proxy) < CLI (requires VPN/proxy, US region recommended). The experience ranking roughly follows the same order — CLI is the most full-featured.

### VS Code Extension

No VPN needed. Just open VS Code, go to the Extensions panel, and search for **Claude Code for VS Code**.

![VS Code extension](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-plugin.png)

After installing, a Claude icon appears in the top right. Click it and you'll be hit with a subscription prompt — that's because it defaults to Anthropic's official models. Once we configure the third-party API later, this prompt goes away.

![Subscription prompt](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-subscribe.png)

You can also disable the login prompt in settings (optional if you've already set up CC Switch). Hit `Ctrl+,` to open VS Code settings (or File → Preferences → Settings), search for `Claude Code Login`, and check **Claude Code: Disable Login Prompt**.

![Disable login](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-disable-login.png)

### Claude Code Desktop

Download from the official site: [Download Claude](https://claude.com/download). A VPN/proxy connection is required — both for downloading and during installation.

Alternatively, grab the installer directly: [Claude Setup.exe](https://github.com/YOUR_GITHUB_USERNAME/Blog-assets/raw/main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-setup.exe)

![Claude download](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-download.png)

Wait for the installation to finish.

![Claude installing](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-installing.png)

### CLI

The CLI is installed separately from the desktop app. A VPN/proxy is required — use a US exit node, otherwise you may hit region blocks.

![CLI install](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cli-install.png)

Here are two native Windows methods (PowerShell and CMD) plus a fallback using WinGet. No extra dependencies needed. I used WinGet — the first two seemed less stable connection-wise.

#### CMD

Press `Win+R`, type `cmd`, and hit Enter.

![CMD run](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cmd-run.png)

Run:

```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

This can take a while — it depends on your connection speed and VPN stability.

![CMD installing](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cmd-installing.png)

#### PowerShell

Right-click the Windows Start menu, open Terminal, and make sure it says Windows PowerShell.

![PowerShell](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-powershell.png)

Run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Wait for it to finish.

![PowerShell installing](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-powershell-installing.png)

#### WinGet

Also in PowerShell:

```powershell
winget install Anthropic.ClaudeCode
```

![WinGet install](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-winget-install.png)

After installation, run `claude -v` to verify. If it prints a version number, you're good. Use `cd` to navigate to your project folder. Since we enabled "Skip Claude Code Initial Setup" in CC Switch, you'll go straight in — there'll be a security prompt; choose the first option, **I trust**.

![Security prompt](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-security.png)

At this point you'll still see Claude Opus 4.7 listed — we haven't configured the third-party API in CC Switch yet (covered below). You're also not logged in, so the model isn't actually usable. If you have a Claude account, you can log in and use it with the standard rate limits.

If the bottom-right corner reads `Update available! Run: winget upgrade Anthropic.ClaudeCode`, an update is available. It's optional — run this in a new terminal if you want to update:

```powershell
winget upgrade Anthropic.ClaudeCode
```

![Update notification](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-update.png)

Once you have at least one of the three Claude Code variants installed, it's time to hook it up to DeepSeek V4. Two approaches: CC Switch (one-click) or the official manual config.

## Connect Claude to DeepSeek V4 Pro

Two methods: follow the official docs and run terminal commands each time, or use CC Switch for one-click switching. I strongly recommend CC Switch — it's simpler and much more convenient.

### CC Switch

Click the `+` button in the top right to create a new provider, which sets up a third-party API for Claude.

For DeepSeek it's straightforward: find DeepSeek in the preset provider list, enter your API Key, and configure the model names.

![New provider](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-provider.png)

Paste the API Key you saved earlier. If you haven't applied for one yet, click **Get API Key** and it'll take you straight to the DeepSeek platform.

![Enter API Key](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-api-key.png)

Next, configure the model names. The current CC Switch version doesn't seem to auto-detect DeepSeek's latest models, so enter these exactly:

**deepseek-v4-pro[1m], deepseek-v4-flash, deepseek-v4-flash[1m], deepseek-v4-pro**

The `[1m]` suffix enables the 1M-token context window — I'd recommend turning it on.

![Model names](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-model-names.png)

For the JSON config, I've enabled **Max thinking**, **Tool Search**, and **Hide AI signature**.

![JSON config](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-json-config.png)

If you're a heavy user, turn on Max thinking — this way you don't have to specify it every session. Max mode is the full DeepSeek V4 experience, with deeper reasoning chains and noticeably better code quality.

For lighter use, leave the defaults and set Max mode in the CLI with `/effort` when needed.

![CLI Max mode](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cli-effort-max.png)

In VS Code, toggle it through the settings menu.

![VS Code settings](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-effort-settings.png)

Enable Tool Search as well — it helps route to the right MCP tools and significantly cuts down wasted tokens.

As for **Hide AI signature**: if you use Claude to commit to GitHub, the default commit message includes a Claude attribution, shown below. Without this setting, you'd need to manually strip the signature from every commit (or ask the AI not to add it via prompt, which is unreliable). Enabling this in JSON skips all that.

![Commit signature](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-commit-signature.png)

### Official Method

The manual approach requires re-entering config every terminal session, or messing with environment variables.

[Claude Code Integration | DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)

Here's the official Windows CLI configuration:

```
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<your DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

For the desktop app, no login is needed. Enable Developer Mode first: **Help → Troubleshooting → Enable Developer Mode**.

![Developer mode](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-dev-mode.png)

Then set up the third-party API: **Developer → Configure Third-Party Inference**.

![Third-party config](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-third-party-config.png)

Follow the two screenshots below.

![Gateway config](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-gateway-config.png)

Gateway base URL: `https://api.deepseek.com/anthropic`, then paste your API Key.

For the models, add **deepseek-v4-flash** and **deepseek-v4-pro**, both with the 1M-context variant enabled.

![Model config](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-model-config.png)

Click **Apply locally**. You can now enter Claude without logging in, and it'll show DeepSeek models.

![Logged in](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-logged-in.png)

All in all, the manual method is noticeably more work — the desktop app and CLI need separate setup. CC Switch handles both in one place.

---

Whichever method you chose, once configured, `cd` into your project folder and you should see **DeepSeek V4 Pro** as the active model. You can also switch models with the `/model` command. From here, Vibe Code away — good prompts make the Agent dramatically more effective, and installing some community Skills can further smooth the experience.

![Model check](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-model-check.png)

![Model switch](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-model-switch.png)

## CC Switch Sync

CC Switch supports cloud sync via WebDAV, so your database — including Skills — can be shared across devices without reinstalling everything. I use [InfiniCLOUD](https://infini-cloud.net/en/modules/mypage/usage/) for this; it's also what I use for Zotero sync across desktop, iPad, and iPhone. The killer feature: InfiniCLOUD is free with 20GB, which is more than enough.

If you're signing up, use my referral code **TP7DS** for an extra 5GB.

One downside: conversation history doesn't sync through CC Switch. I won't go deep on the sync details here — I'm planning a separate post on setting up InfiniCLOUD for Zotero sync.

![WebDAV sync](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-webdav-sync.png)

As a side note: you can install the **DeepSeek V4 for Copilot Chat** extension in VS Code to use DeepSeek V4 through Copilot. But honestly, there's not much advantage — the cache hit rate is lower than Claude Code + DeepSeek V4, which means higher costs.