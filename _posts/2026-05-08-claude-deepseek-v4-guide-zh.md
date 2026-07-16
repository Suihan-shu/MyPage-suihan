---
layout: post
title: "Claude配置DeepSeek v4不完全指南"
date: 2026-05-08 23:00:00 +0800
categories: ["Tools & Resources"]
tags: ["Claude Code", "DeepSeek V4", "CC Switch", "AI Agent"]
description: "Claude Code配置DeepSeek V4全流程：API申请、CC Switch配置、桌面端/CLI/VS Code插件安装与优化。"
lang: zh
lang-ref: post-claude-deepseek-v4-guide-01
toc:
  sidebar: left
series_key: geek-survival-guide
series_order: 4
giscus_comments: true
---

由于最近 Copilot 非常不给力，使用体验很差，于是开始尝试用 Claude 配置 DeepSeek V4。目前用下来感觉还是比较 ok 的，性价比也很高，遂将自己的配置过程整理成文，大家按需配置。

整个过程会涉及五个环节：申请 DeepSeek API → 安装 CC Switch 管理工具 → 安装 Claude Code（三种方式任选）→ 配置 DeepSeek V4 → 同步设置。

2026.5.18更新：2026年5月起，Claude桌面端缩紧了第三方模型的接入，可以直接看本文CC Switch的配置方式了，在版本v3.15.0之后，已经支持了Claude Code桌面端的单独切换，[官方文档](https://ccswitch.io/zh/docs?section=providers&item=claude-desktop)过程比较详细了，如果是已经配置了CC Switch的，可以直接导入配置。没有导入的类似于CLI的API配置过程，没有差别。关键在于每次启动Claude桌面端都需要打开CC Switch，然后开启左上角的路由模式。


## 申请DeepSeek API

首先需要在 DeepSeek 开放平台申请。

然后点击左侧 API keys，创建 API Key，自己定义一个名字。

![创建API Key](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-deepseek-api-keys.png)

创建之后会弹出如下窗口，**一定要注意复制好这个 API Key，它只会显示一遍**，然后可以新建文档将其保存在本地，切记不要暴露在互联网上。如果没有复制也不要紧，删除新建一个 API 即可。

![API Key弹窗](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-api-key-popup.png)

API Key 拿到手之后，接下来就是工具链的搭建。推荐先装 CC Switch，它能把后面所有配置统一管理起来。

## 安装CC Switch

CC Switch 是一个统一管理 Claude Code、Codex、Gemini CLI 供应商配置的桌面工具。好处是不用记环境变量，切换模型点两下就行，MCP 和 Skills 也能统一管理，还能看到每次的对话记录。

在项目仓库下载最新 Release 即可 [Release CC Switch · farion1231/cc-switch](https://github.com/farion1231/cc-switch/releases)，顶部为最新版本，往下划就能看到下载位置Assets
，可能显示的列表里没有Windows，点击`Show all assets`展开就能看到，通常下载`CC-Switch-v3.xx.x-Windows.msi`就行


Windows 也可以直接点击右侧超链接下载(目前是3.14，建议点击上方Release链接下载最新版)：[CC-Switch-v3.14.1-Windows.msi](https://github.com/YOUR_GITHUB_USERNAME/Blog-assets/raw/main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-installer.msi)

双击进行安装，根据自身情况选择安装位置，一路 Next 下去即可。

![CC Switch安装](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-install.png)

安装完后打开界面如下，第一个就是 Claude，上方还可以选择 ChatGPT、Gemini 等大模型进行管理，此处主要针对 Claude Code，安装完成便可以安装 Claude 并且进行配置。

![CC Switch主界面](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-main.png)

然后想在各种 IDE 里面使用 Claude 的话，就需要下载 Claude 插件。在 CC Switch 主页面左上角打开设置，在窗口划到底部找到 `应用到 Claude Code 插件` 并打开，可以跟随 CC Switch 进行切换，无需每次手动切换。

并且把 `跳过 Claude Code 初次安装确认` 打开，就可以跳过一些初始设置。

![CC Switch设置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-settings.png)

CC Switch 配置好后，接下来安装 Claude Code 本体。三种方式各有侧重，按需选择。

## 安装Claude Code

Claude Code 桌面端、CLI 和 Visual Studio Code 插件都可以接入 DeepSeek 模型。桌面端更适合执行一些问答、对话，我没有太多的尝试，目前 DeepSeek V4 在多模态上的能力还是有所缺少的，所以可能体验不如 Claude、GPT 和 Gemini，不过可能月底会更新多模态能力，可以期待一手。至于 CLI 更适合执行一些编程任务，Claude 在 Prompt Engineering 这块确实很有说法，使用体验很不错。相较于 TARE、Copilot 等，我觉得无论是上下文记忆还是输出质量，都是遥遥领先了。目前我主要的使用方式还是在 VS Code 里用插件，因为我并不是完全交由 AI 处理项目，Agent 更多是辅助，在 VS Code 里更方便运行查看相关报错、运行结果等，且依托于 VS Code 丰富的插件生态，还可以能够拥有比较好的开发体验。接下来将分别介绍它们的安装与配置。

Claude Code 桌面端、CLI 和 Visual Studio Code 插件三种方式是相互独立的，没有依赖也不会捆绑安装，大家按需选择并安装。

个人觉得按安装难度排序的话：Visual Studio Code 插件 < Claude Code 桌面端(需要科学上网) < CLI(需要科学上网)，使用体验上可能也是这个排序，CLI 是功能最完整的。

### Visual Studio Code 插件

无需科学上网，只要有 Visual Studio Code，直接打开在插件栏里搜索 Claude Code for VS Code。

![VS Code插件](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-plugin.png)

安装完成后窗口右上角会显示 Claude 的图标，点击就会发现没有订阅的话，是无法直接使用 Claude 插件，会弹出订阅界面，因为它默认只使用 Claude 官方的模型，后续配置好第三方 API 后，就不会弹出这个界面了。

![订阅界面](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-subscribe.png)

也可以在设置里禁用登录(这步可以跳过，CC Switch 里设置好了也不需要登录)，用快捷键 `ctrl+,` 进入 VS Code 设置（也可以在左上角的菜单 File → Preference → Settings 进入），在上方搜索栏搜索 `Claude Code Login`，勾选上 Claude Code: Disable Login Prompt。

![禁用登录](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-disable-login.png)

### Claude Code 桌面端

在官网下载即可 [Download Claude | Claude by Anthropic](https://claude.com/download)，需要科学上网，安装过程也需要。

也可以直接点击右侧直接下载安装包(非最新版) [Claude Setup.exe](https://github.com/YOUR_GITHUB_USERNAME/Blog-assets/raw/main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-setup.exe)

![Claude下载](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-download.png)

等待安装完成即可。

![Claude安装中](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-installing.png)

### CLI

下载 Claude Code 桌面端并不会同步下载 CLI，CLI 需要科学上网建议 US，要不然会卡地区。

![CLI安装](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cli-install.png)

这里给出 PowerShell 和 CMD 两种原生安装方式（Windows 平台）以及一种备选方式 WinGet，无需安装其他依赖。我采用的是 WinGet 安装，前两种方式似乎连接不太稳定。

#### CMD

使用快捷键 `win+R` 打开运行，输入 cmd。

![CMD运行](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cmd-run.png)

输入以下命令：

```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

等待安装完毕，过程可能会比较漫长，取决网速和科学上网稳定性。

![CMD安装中](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cmd-installing.png)

#### PowerShell

Windows 菜单右键找到终端，打开终端，注意是否显示 Windows PowerShell。

![PowerShell](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-powershell.png)

输入以下命令：

```powershell
irm https://claude.ai/install.ps1 | iex
```

等待运行结束。

![PowerShell安装中](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-powershell-installing.png)

#### WinGet

同样是在 PowerShell 终端中执行命令：

```powershell
winget install Anthropic.ClaudeCode
```

![WinGet安装](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-winget-install.png)

安装完成后输入 `claude -v`，如果正常安装，就会显示 Claude Code 的版本号。这时就可利用 `cd` 命令进入项目文件夹，由于前面已经设置了 CC Switch 跳过初次安装确认，所以直接就是进入项目文件夹，有一个安全向导，默认选择第一个 I trust 就行。

![安全向导](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-security.png)

进入之后可以发现，现在还是 Claude Opus 4.7，因为我们还没有在 CC Switch 里配置第三方 API，后文将给出配置步骤。并且我们现在是未登录状态，所以没有办法使用该模型，如果有 Claude 账号是可以登录并使用的，但会有限额。

如果打开 Claude 右下角如图显示 `Update available! Run: winget upgrade Anthropic.ClaudeCode`，就表示需要更新了，更新不是必要的，自行选择，想更新新建终端运行给出的命令即可：

```powershell
winget upgrade Anthropic.ClaudeCode
```

![更新提示](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-claude-update.png)

三种方式装好任意一种之后，就可以着手把 Claude 接到 DeepSeek V4 上了。两种方案：CC Switch 一键切换，或者按官方文档手动配。

## Claude接入DeepSeek V4 Pro

这块存在两种方式，一种是根据官方文档，在终端中执行命令，另一种是通过 CC Switch 一键切换与管理。

在这里我比较推荐 CC Switch，配置起来比较简单，也很便捷。

### CC Switch

在右上角点击 `+` 新建供应商，即可配置 Claude 的第三方 API。

配置 DeepSeek 很简单，预设供应商里找到 DeepSeek，然后输入 API Key 并配置模型名称即可。

![新建供应商](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-provider.png)

输入 API Key（就是之前在 DeepSeek 开放平台申请 API 时弹出窗口的那一串字符），如果没有申请的话，直接点击获取 API Key 就会自动跳转到 DeepSeek 开放平台，在上面申请就行。

![输入API Key](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-api-key.png)

之后要配置模型名称，CC Switch 现在这个版本好像没有自动支持 DeepSeek 的最新模型。

名称需要合规，完全按照以下图片输入即可，`[1m]` 后缀表示开启 1M 长上下文，建议开启。

**deepseek-v4-pro[1m], deepseek-v4-flash, deepseek-v4-flash[1m], deepseek-v4-pro**

![模型名称配置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-model-names.png)

关于 JSON 配置，我主要是勾选了最大强度思考、启用 Tool Search、隐藏 AI 署名。

![JSON配置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cc-switch-json-config.png)

如果使用强度比较大，建议还是勾选最大强度思考，这样不需要每次都指定，Max 模式才是 DeepSeek V4 完整体。这个模式会调用更深的推理链路，code 质量提升很明显。

使用强度不高的则可以保持默认，然后在 CLI 里可以用 `/effort` 来设置 Max 模式。

![CLI Max模式](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-cli-effort-max.png)

在 VS Code 里则是点击设置。

![VS Code设置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-vscode-effort-settings.png)

启用 Tool Search 也可以勾选上，可以更好地根据需求选择 MCP Tool，显著减少无效 Token 消耗。

至于隐藏 AI 署名，就是如果你会借助 Claude 提交 GitHub 的话，默认的 Commits 会有 Claude 的署名，如下图所示。如果你不想要这个字段，在对话中则每次 commit 都需要手动删除 Claude 的字段，或者在提示词中要求 AI 不加署名（没那么可靠），直接在 JSON 设置好的话，就可以 pass 这些步骤。

![GitHub署名](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-commit-signature.png)

### 官方文档

每次启动终端都需要输入配置，比较麻烦，或者要去环境变量里设置。

[接入 Claude Code | DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)

这里给出官方文档在 Windows 平台针对 CLI 接入 Claude 给出的命令：

```
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

关于桌面端的接入，不需要登录，只需要进入开发者模式，在桌面端左上角的菜单 **Help → Troubleshooting → Enable Developer Mode**。

![开发者模式](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-dev-mode.png)

接下来就可以对第三方 API 进行配置，**Developer → Configure Third-Party Inference**。

![第三方API配置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-third-party-config.png)

按照下面两图进行配置。

![Gateway配置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-gateway-config.png)

Gateway base URL 输入：`https://api.deepseek.com/anthropic`，然后粘贴 API Key。

模型配置如下图，新添加两个模型 **deepseek-v4-flash** 和 **deepseek-v4-pro**，都开启 1M-context variant（1M 上下文）。

![模型配置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-model-config.png)

配置完成后点击 Apply locally，之后就可以免登录进入 Claude 界面，并显示 DeepSeek 的模型了。

![登录后的界面](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-logged-in.png)

总之设置起来还是要麻烦一些的，Claude Code 桌面端和 CLI 得分开设置，在 CC Switch 里的话就可以一键设置了。

---

选择一种方式配置完成后进入项目文件夹，就会显示使用的模型是 DeepSeek V4 Pro，也可以通过 `/model` 命令进行切换。之后就可以开启 Vibe Code 之旅，给出高质量的提示词可以使得 Agent 更加有效，也可以去安装一些常用的 Skill，这些都能够帮你更好地使用 AI。

![模型确认](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-model-check.png)

![模型切换](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-model-switch.png)

## CC Switch同步设置

CC Switch 也可以设置云同步，配置 WebDAV，在多设备使用的时候就可以同步数据库，实现 Skill 跨设备同步，无需重复安装。我采用的方式是 [InfiniCLOUD](https://infini-cloud.net/en/modules/mypage/usage/)，Zotero 也是采用这个进行不同设备间的文献同步，从电脑到 iPad 甚至 iPhone 都可以。重点是 InfiniCLOUD 免费，有 20G 空间，完全够用了。

如果需要注册的话可以点击超链接 [InfiniCLOUD](https://infini-cloud.net/en/modules/mypage/usage/) 在网站注册，可以使用我的邀请码 **TP7DS**，能多获得 5G 空间。

比较可惜的是 CC Switch 这个配置没有办法将对话记录同步，这里也不太赘述同步相关内容，后续考虑再写一个关于 InfiniCLOUD 设置 Zotero 同步的 Blog。

![WebDAV同步](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/claude-deepseek-v4-guide/claude-deepseek-v4-guide-webdav-sync.png)

此外在 VS Code 里下载插件 DeepSeek V4 for Copilot Chat 就可以配置 Copilot 使用 DeepSeek V4，但 Copilot 好像没啥优势，缓存命中率也比 Claude Code 接入 DeepSeek V4 要低，费用会更高。
