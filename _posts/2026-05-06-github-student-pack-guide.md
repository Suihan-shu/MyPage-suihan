---
layout: post
title: "GitHub学生包审核越来越严？我踩过的坑和一份可复现流程"
date: 2026-04-18 23:00:00 +0800
categories: ["Tools & Resources"]
tags: ["GitHub Education", "Copilot", "Student Developer Pack", "CHSI"]
description: "GitHub学生包申请全流程：学信网认证翻译、IP避坑、Copilot Pro领取实操。"
lang: zh
toc:
  sidebar: left
series_key: geek-survival-guide
series_order: 3
giscus_comments: true
---

## 写在前面

如今AI发展速度确实快，Agent 的概念也从去年火到了现在。但身为学生，想自己折腾 Agent 往往会被昂贵的 Token 和订阅价格劝退——大部分人很难及时体验到前沿技术，只能停留在网页端对话那个层面。

经常用 IDE 的同学可能会注意到，像 VSCode 里都有一个叫 GitHub Copilot 的插件。最开始多是 ask 对话形式，随着 Agent 的发展也逐步推出了 agent 模式，可以自动帮你编辑代码、新建文件、运行代码。但我觉得不是说有了这些就可以抛弃基础知识的学习——正如前面 Blog 所说，架构越来越重要，要是真的什么都不懂，很难用好 AI 去实现自己的需求。我推荐 Agent 的原因也是觉得我们首先要把工具用起来，然后才会越用越好。如今发展速度越来越快，而且都是在前面的基础上去优化，Agent 都用不好，就更别说 OpenClaw 和 Harness Engineering 了。

拿我自己来说，对 Prompt 工程其实很早就有所耳闻，只是一直没太放在心上。我个人的感受是，网页端天然不太适合做一些正经的 Prompt 工程——这里面往往会涉及不同文件的规范，比如有约束行为的文件、有定义流程的文件等等。再加上大部分人网页对话存在不连续性，时间上的不连续，最开始可能还会注意提示词的书写，到后面就随意了，这让 Prompt 工程很难真正生效。所以我之前一直停留在"给角色 → 列约束 → 实现目标"这种简单 prompt，而且往往只在一段对话的开头这么做，后面就根据问题随意发挥了。但后面开始做稍微大一点的项目，发现这种形式就容易变得很乱。Agent 加上 Prompt 工程才是正解——通过使用 Agent，我觉得可以去提高 Prompt 的能力，它也可以是一个系统，从而更好地使用 AI 实现需求。

包括 ChatGPT 也开始大力转型，推出 Codex，有桌面端也有插件。这些都会有免费额度，但老问题还是没变——额度太少了，Agent 这种模式需要经常读写文件，本就会消耗大量 Token，免费的那些额度根本经不起几次问答。

好在 GitHub 很早就有学生包。我最开始认证多是通过它来薅 JetBrains 全家桶，后面逐步开始用 Copilot 的 ask 模式，再到现在日常跑 Agent。申请就两条路：学生邮箱，加上传一些有效证明，即可获得 Copilot Pro。尽管三月份经历了一次大削，把一些最前沿的模型给 ban 了，得另外付费或者接入相关 API，但整体来说还是很良心的。

此外由于各种原因，学生包的审核机制越来越严格，很多人卡在审核阶段，上传材料经常被拒（以前传张校园卡、学生证就能过，现在得学信网认证翻译、还会卡 IP 等）。前阵子有学弟学妹咨询过相关问题，但我看网上的解决方案或多或少有些麻烦——比如卡 IP 基本没人提及，学信网认证翻译也写得太繁琐。于是生出想自己写一篇申请流程的想法，省得反复跟学弟学妹说，也能帮到一些有需要的人。

## 认证流程

### 第一步：注册GitHub账号与添加学生邮箱

首先得有一个 GitHub 账号。去 [github.com/join](https://github.com/join) 注册，用你的常用邮箱就行。**不建议直接用学生邮箱注册主账号**——很多学校毕业后会回收邮箱，到时候换号很折腾。

注册完后，进入 [Settings → Access → Emails](https://github.com/settings/admin)，把学校分配的 `.edu` 或 `.edu.cn` 邮箱添加进去，注意查收验证邮件进行验证。

![添加学生邮箱](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-email-settings.png)

> 如果是直接用教育邮箱注册的 GitHub，可以跳过这一步

### 第二步：完善账单信息（提高通过率）

接下来，为了提高申请通过率，可以去 [Billing → Payment Information](https://github.com/settings/billing/payment_information) 添加一下账单信息：

- **名字**：用拼音，名在前姓在后，最好和学信网验证报告翻译后的姓名保持一致
- **地址**：去学校官网底部抄对应校区的英文地址
- **VAT**：不填——所以其实压根没有支付信息

填写完后，点击 **"Save billing information"**。

![账单信息填写](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-billing-info.png)

不用担心被扣费——学生包有效期内 Copilot Pro 完全免费，这里只是身份验证。下面这张图是申请被拒给出的一些原因，其中就包含账单信息缺失和 IP/定位问题。所以如果被拒，优先检查这两个点：

![被拒原因示例](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-rejection-reasons.png)

### 第三步：学信网在线认证申请与翻译

这是整个流程最重要的环节，也是被拒的重灾区。GitHub 审核对英文更友好，中文报告大概率被打回来。

**第一步：获取中文在线验证报告**

1. 打开 [学信档案](https://my.chsi.com.cn/archive/bab/index.action)，登录
2. 在"在线验证报告"区域找到 **"教育部学籍在线验证报告"**，点击申请（这里申请的是中文版，学信网英文版要 30 元翻译服务费，申请 GitHub 学生包大可不必那么规范）

![学信档案页面](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-chsi-archive.png)

3. 申请完成后，在右上角点击下载，保存在线验证报告 PDF

![下载验证报告](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-chsi-report.png)

**第二步：翻译 PDF 为英文**

拿到中文 PDF 后需要翻译成英文。这里强烈安利一个在线 PDF 网站——[iLovePDF](https://www.ilovepdf.com)，这是我认为最好用的 PDF 工具站，功能免费，界面简洁，审美在线。并且它也有[iLovePDF教育版](https://www.ilovepdf.com/zh-cn/education)，用教育邮箱即可注册。它家姐妹站 [iLoveIMG](https://www.iloveimg.com/zh-cn) 也提供了一些基本图像处理功能。桌面的 PDF 阅读器No.1则属 Adobe Acrobat DC。

![iLovePDF 首页](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-ilovepdf-home.png)

操作很简单：打开网站，翻到最下方，找到 **"Translate PDF"** 功能，将中文报告上传后选择翻译方向为 **中文 → 英文**（如果中文界面无法选英文就先切换成英文界面即可）。翻译要注意确保英文版报告完整、清晰，重点确认姓名、学校、就读状态、有效期等信息。

![PDF翻译](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-pdf-translate.png)

### 第四步：提交学生包申请

完成以上步骤就可以开始申请了。打开 [github.com/settings/education/benefits](https://github.com/settings/education/benefits)，点击 **"Start an application"**。

![开始申请](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-apply-start.png)

表单填写流程：

1. 选择身份 **"Student"**（学生）
2. 第二步选择学校 **"Select this school"**（找到自己的学校，若搜索不到可核对学校名称拼写）
3. 第三步点击 **"Share Location"**（分享位置，浏览器弹出位置请求则点击允许），再点击 **"Continue"**（继续）
   - 这就是 IP/定位检查点——**不要挂梯子**，确保在校园网或学校 VPN 下操作。有多个校区的话也需要注意定位是否匹配
4. 在 **"Proof"**（证明材料）选项中选择 **"Dated school ID"**，上传翻译后的在线验证报告

这个申请审核速度比较快，被拒也很快。如果被拒就根据反馈的注意事项重新检查。一般学信网验证报告可以一遍过，校园卡这种现在已经很难通过了。**但是相关权益要 1-3 天才会发放。**

通过后去 [GitHub Student Developer Pack](https://education.github.com/pack) 可以看到权益清单：

![学生包权益](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-benefits.png)

同时也收到一封确认邮件：

![通过邮件](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-approval-email.png)

之后就能用以下这些权益了——最有用的是 GitHub Copilot Pro、JetBrains 全家桶（PyCharm、IDEA 等）还有 1Password，当然不仅限于这些，还有一些免费服务器和课程等等，可以自行探索：

![全部权益](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-perks.png)

### 第五步：领取Copilot Pro 权益

现在 Copilot 的权益不会自动到账，需要主动领取。去 [GitHub Student Developer Pack](https://education.github.com/pack) 页面找到 Copilot 点击领取即可。

![领取Copilot](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-copilot-claim.png)

![Copilot领取确认](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-copilot-claim-2.png)

### 第六步：关闭数据训练（隐私设置）

申请完成后，由于 Copilot 条款的变更，你的所有数据默认会被拿去训练模型。这个可以手动选择关闭。

去 [Copilot Settings → Features](https://github.com/settings/copilot/features)，滑到最底部，在隐私设置里把第二个选项——**"Allow GitHub to use my code snippets for product improvements"** 关掉即可。

![关闭数据训练](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-copilot-privacy.png)

基本流程就这些。希望大家申请顺利，开启 Agent 之路。

---

## 2026.05.06 二编

没想到这篇 Blog 发出不久，Copilot 发生了两次重大改变。

**从 2026 年 4 月 20 日起**，新的 Copilot Pro、Copilot Pro+ 和学生计划的注册**暂时暂停**。也就是说现在暂时没法获得 Copilot Pro 权益了——可能与 Copilot 计划的变更有关，再加上算力资源紧张。紧接着 **4 月 28 日**，Copilot 宣布从 6 月 1 日起改用 AI Credits 按 Token 量计费。没想到这天来得这么快。

![Copilot暂停公告](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/github-student-pack/github-student-pack-copilot-paused.png)

后续应该还是会恢复权益的，所以可以先把学生包认证了，看看其他权益能不能用上。且薅且珍惜吧。

## 个人感悟

最近其实用 Copilot 的体验越来越差了。先是三月份宣布高级模型收费，四月越到后面可用模型越来越少，而且多了五小时限制和周限制——我没有准确统计，但差不多专注 AI coding 一两个小时就会触发五小时限制，周限制也是很快打满。更难受的是一旦到了限制就中断回答，想继续只能切换至 auto（根据官方文档的说法），切过几次，前后效果差异很大，模型性能差别太大了。一些简单的 ask 还行，一旦复杂起来很难达到预期效果。后续按 Token 计费，很有可能 auto 也没法用了。

可能也是现在算力资源紧张吧。四月之前用 Copilot 确实很顺手，每个月都能把额度用满。对于 Copilot 的行为也能理解——免费的 Agent 会越来越少，这趋势是明摆着的。

折腾来折腾去，我已经开始尝试新方案了。DeepSeek V4 的推出，性价比拉满，非常适合学生党。我尝试用 Claude 配置 DeepSeek V4 来使用 Agent，最近开始深度使用测试其能力。后续可能再写一篇 Blog 讲具体怎么配置。
