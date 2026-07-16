# Claude接入DeepSeek v4不完全指南

由于最近Copilot非常不给力，使用体验很差，遂开始尝试使用Claude接入DeepSeek v4，目前用起来感觉还是比较ok的，也很有性价比，于是将自己的配置过程整理成文，大家按需进行配置

## 申请DeepSeek API

首先需要在DeepSeek开放平台申请

然后点击左侧API keys，创建API Key，自己定义一个名字

![image-20260508003545395](./assets/image-20260508003545395.png)

创建之后会弹出如下窗口，==一定要注意复制好这个API Key，它只会显示一遍==，然后可以新建文档将其保存在本地，切记不要暴露在互联网上。如果没有没复制也不要紧，删除新建一个API即可

![屏幕截图 2026-05-08 003633](./assets/屏幕截图 2026-05-08 003633.png)

## 安装CC Switch

CC Switch 是一个统一管理 Claude Code、Codex、Gemini CLI 供应商配置的桌面工具。好处是不用记环境变量，切换模型点两下就行，MCP 和 Skills 也能统一管理，还能看到每次的对话记录

在项目仓库下载最新Release即可[Release CC Switch v3.14.1 · farion1231/cc-switch](https://github.com/farion1231/cc-switch/releases/tag/v3.14.1)，滑到底部选择自己需要的版本

Windows也可以直接点击右侧超链接下载：[CC-Switch-v3.14.1-Windows.msi](assets\CC-Switch-v3.14.1-Windows.msi)

双击进行安装，根据自身情况选择安装位置，一路Next下去即可

![image-20260508105655548](./assets/image-20260508105655548.png)

安装完后打开界面如下，第一个就是Claude，上方还可以选择ChatGPT、Gemini等大模型进行管理，此处主要针对Claude Code，安装完成便可以安装Claude并且进行配置

![image-20260508105811950](./assets/image-20260508105811950.png)

然后想在各种IDE里面使用Claude的话，就需要下载Claude插件，在CC Swtich主页面左上角打开设置，在窗口划到底部找到`应用到Cluade Code插件`并打开，可以跟随CC Switch进行切换，无需每次手动切换

并且把`跳过Cluade Code初次安装确认`打开，就可以跳过一些初始设置

![image-20260508121746922](./assets/image-20260508121746922.png)

## 安装Claude Code

Claude Code桌面端、CLI和Visual Stdio Code插件都可以接入DeepSeek模型，桌面端更适合执行一些问答、对话，我没有太多的尝试，目前DeepSeek V4在多模态上的能力还是有所缺少的，所以可能体验不如Claude、GPT和Gemini，不过可能月底会更新多模态能力，可以期待一手。至于CLI更适合执行一些编程任务，Claude在Prompt Engineering这块确实很有说法，使用体验很不错。相较于TARE、Copilot等，我觉得无论是上下文记忆还是输出质量，都是遥遥领先了。目前我主要的使用方式还是在VS Code里用插件，因为我并不是完全交由AI处理项目，Agent更多是辅助，在VS Code里更方便运行查看相关报错、运行结果等，且依托于VS Code丰富的插件生态，还可以能够拥有比较好的开发体验。接下来将分别介绍它们的安装与配置

Claude Code桌面端、CLI和Visual Stdio Code插件三种方式是相互独立的，没有依赖也不会捆绑安装，大家按需选择并安装

个人觉得按安装难度排序的话：Visual Stdio Code插件＜Claude Code桌面端(需要科学上网)<CLI(需要科学上网)，使用体验上可能也是这个排序，CLI是功能最完整的

### Visual Stdio Code插件

无需科学上网，只要有Visual Stdio Code，直接打开在插件栏里搜索Claude Code for VS Code

![image-20260508104520599](./assets/image-20260508104520599.png)

安装完成后窗口右上角会显示Claude的图标，点击就会发现没有订阅的话，是无法直接使用Claude插件，会弹出订阅界面，因为它默认只使用Claude官方的模型，后续配置好第三方API后，就不会弹出这个界面了

![image-20260508104903722](./assets/image-20260508104903722.png)

也可以在设置里禁用登录(这步可以跳过CC Switch里设置好了也不需要登录)，用快捷键`ctrl+,`进入VS Code设置（也可以在左上角的菜单File →preference→Settngs进入），在上方搜索栏搜索`Claude Code Login`，勾选上Claude Code: Disable Login Prompt

![image-20260504111939514](./assets/image-20260504111939514.png)

### Claude Code桌面端

在官网下载即可[Download Claude | Claude by Anthropic](https://claude.com/download)，需要科学上网，安装过程也需要

也可以直接下载点击右侧直接下载安装包 [Claude Setup.exe](assets\Claude Setup.exe) 

![image-20260508101938229](./assets/image-20260508101938229.png)

等待安装完成即可

![image-20260508103219525](./assets/image-20260508103219525.png)

### CLI

下载Claude Code桌面端并不会同步下载，需要科学上网建议US，要不然会卡地区

![image-20260508113828267](./assets/image-20260508113828267.png)

这里给出PowerShell和CMD两种原生安装方式（Windows平台）以及一种备选方式WinGet ，无需安装其他依赖，我才用的是WinGet安装，前两种方式似乎连接不太稳定

#### CMD

使用快捷键`win+R`打开运行，输入cmd

![image-20260508114815758](./assets/image-20260508114815758.png)

输入以下命令

```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

等待安装完毕，过程可能会比较漫长，取决网速和科学上网稳定性

![image-20260508114945891](./assets/image-20260508114945891.png)

#### PowerShell

Windows菜单右键找到终端，打开终端，注意是否显示Windows PowerShell

![image-20260508115048347](./assets/image-20260508115048347.png)

输入以下命令

```powershell
irm https://claude.ai/install.ps1 | iex
```

等待运行结束

![image-20260508115232774](./assets/image-20260508115232774.png)

#### WinGet

同样是在PowerShell终端中执行命令

```powershell
winget install Anthropic.ClaudeCode
```

![image-20260508160917279](./assets/image-20260508160917279.png)

安装完成后输入`claudde -v`，如果正常安装，就会显示Claude Code的版本号，这时就可利用`cd`命令进入项目文件夹，由于前面已经设置了CC Switch跳过初次安装确认，所以直接就是进入项目文件夹，有一个安全向导，默认选择第一个I trust就行

![image-20260508161803475](./assets/image-20260508161803475.png)

进入之后可以发现，现在还是Claude Opus 4.7，因为我们还没有在CC Switch里配置第三方API，后文将给出配置步骤，并且我们现在是未登录状态，所以没有办法使用该模型的，如果有Claude账号是可以登录并使用的，但会有限额

如果打开Claude右下角如图显示`Update available! Run: winget upgrade Anthropic.ClaudeCode`，就表示需要更新了，更新不是必要的，自行选择，想更新新建终端运行给出的命令即可

```powershell
winget upgrade Anthropic.ClaudeCode
```

![image-20260508162207541](./assets/image-20260508162207541.png)



## Claude接入DeepSeek V4 Pro

这块存在两种方式，一种是根据官方文档，在终端中执行命令，另一种是通过CC Switch一键切换与管理

在这里我比较推荐CC Switch，配置起来比较简单，也很便捷

### CC Switch

在右上角点击`+`新建供应商，即可配置在Claude的第三方API

配置DeepSeek很简单，预设供应商里找到建找到DeepSeek，然后输入API Key并配置模型名称即可

![image-20260503220440943](./assets/image-20260503220440943.png)

输入API Key（就是之前在DeepSeek开放平台申请API时弹出窗口的一串字符），如果没有申请的话，直接点击获取API Key就会自动跳转到DeepSeek开放平台，在上面申请就行

![image-20260508111028761](./assets/image-20260508111028761.png)

之后要配置模型名称，CC Switch现在这个版本好像没有自动支持DeepSeek的最新模型

名称需要合规，完全按照以下图片输入即可，[1m]后缀表示开启1M长上下文，建议开启

**deepseek-v4-pro[1m], deepseek-v4-flash, deepseek-v4-flash[1m], deepseek-v4-pro**

![image-20260503221032612](./assets/image-20260503221032612.png)

关于JSON配置，我主要是勾选了最大强度思考、启用Tool Search、隐藏AI署名

![image-20260508112102254](./assets/image-20260508112102254.png)

如果使用强度比较大，建议还是勾选最大强度思考，这样不需要每次都指定，Max 模式才是 DeepSeek V4完整体。这个模式会调用更深的推理链路，code质量提升很明显

使用强度不高的则可以保持默认，然后在CLI里可以用用/effort 来设置 Max 模式

![image-20260503221651773](./assets/image-20260503221651773.png)

在VS Code里则是点击设置

![image-20260508111706526](./assets/image-20260508111706526.png)

启用Tool Search也可以勾选上，可以更好的根据需求选择MCP Tool，显著减少无效Token消耗

至于隐藏AI署名，就是如果你会借助Cluade提交Github的话，默认的Commits会有Claude的署名，如下图所示

如果你不想要这个字段，在对话中则每次commit都需要手动删除Claude的字段，或者在提示词中要求AI不加署名（没那么可靠），直接在JSON设置好的话，就可以pass这些步骤

![image-20260508112930162](./assets/image-20260508112930162.png)



### 官方文档

每次启动终端都需要输入配置，比较麻烦，或者要去环境变量里设置

[接入 Claude Code | DeepSeek API Docs](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)

这里给出官方文档在Windows平台针对CLI接入Claude给出的命令

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

关于桌面端的接入，不需要登录，只需要进入开发者模式在桌面端左上角的菜单**Help → Troubleshooting → Enable Developer Mode**

![image-20260508103251977](./assets/image-20260508103251977.png)

接下来就可以对第三方API进行配置，**Developer→ Configure Third-Party Inference**

![image-20260508010951203](./assets/image-20260508010951203.png)

按照下面两图进行配置

![image-20260508011031109](./assets/image-20260508011031109.png)

Gateway base URL输入：https://api.deepseek.com/anthropic，然后粘贴API Key

模型配置如下图，新添加两个模型**deepseek-v4-flash**和**deepseek-v4-pro**，都开启1M-context variant（1M上下文）

![image-20260508011137550](./assets/image-20260508011137550.png)

配置完成后点击Apply locally，之后就可以免登录进入Claude界面，并显示DeepSeek的模型了

![image-20260508012031089](./assets/image-20260508012031089.png)

总之设置起来还是要麻烦一些的，Claude Code桌面端和CLI得分开设置，在CC Switch里的话就可以一键设置了



选择一种方式配置完成后进去项目文件夹，就会显示使用的模型是DeepSeek V4 Pro，也可以通过`/model`命令进行切换，之后就可以开启Vibe Code之旅，给出高质量的提示词可以使得Agent更加有效，也可以去安装一些常用的Skill，这些都能够帮你更好的使用AI

![image-20260508163523082](./assets/image-20260508163523082.png)

![image-20260508163732749](./assets/image-20260508163732749.png)

## CC Switch同步设置

CC Switch也可以设置在云同步，配置WebDev，在多设备使用的时候就可以同步数据库，实现这样一些Skill跨设备同步，无需重复安装，我采用的方式是[InfiniCLOUD](https://infini-cloud.net/en/modules/mypage/usage/)，Zotero也是采用这个进行不同设备间的文献同步，从电脑到iPad甚至iPhone都可以，重点是InfiniCLOUD免费，有20G空间，完全够用了

如果需要注册的话可以点击超链接[InfiniCLOUD](https://infini-cloud.net/en/modules/mypage/usage/)在网站注册，可以使用我的邀请码TP7DS，能多获得5G空间

比较可惜的是CC Switch这个配置没有办法将对话记录同步，这里也不太赘述同步相关内容，后续考虑再写一个关于InfiniCLOUD设置Zotero同步的Blog

![image-20260508121207149](./assets/image-20260508121207149.png)

此外在vscode里下载插件DeepSeek V4 for Copilot Chat就可以配置Copilot使用DeepSeek v4，但Copilot好像没啥优势，缓存命中率也比Claude Code接入DeepSeek V4要低，费用会更高

唯一就是在额度耗尽的时候，切换到DeepSeek把当前任务完成，现在copilot的额度越来越抠搜了，差不多2%就到周限度了，真是无语了