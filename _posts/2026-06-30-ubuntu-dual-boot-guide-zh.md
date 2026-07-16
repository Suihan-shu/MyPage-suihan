---
layout: post
title: "Ubuntu 双系统安装指北"
date: 2026-06-30 20:30:00 +0800
categories: ["Tools & Resources"]
tags: ["Ubuntu", "Dual Boot", "Linux", "Windows"]
description: "Ubuntu 双系统安装全流程：准备工作、分区方案、安装步骤、系统删除。"
lang: zh
lang-ref: post-ubuntu-dual-boot-guide-01
series_key: dev-env-setup
series_order: 1
toc:
  sidebar: left
giscus_comments: true
---

## 安装前的准备

### 关闭 BitLocker

BitLocker 是 Windows 的磁盘加密机制，部分电脑出厂默认开启。开启后磁盘图标会显示一把锁，在 Windows 安全中心或控制面板里可以关闭。

经常折腾电脑的话，BitLocker 一定要关。否则系统崩了要重装，或者把硬盘拆出来备份数据时，所有磁盘操作都会要求密钥。除非有安全需求，平时关掉省事。

### 关闭 Secure Boot

Secure Boot 的设计目的是防止恶意软件损坏系统组件，但同时也会阻止非 Windows 系统的安装和启动。需要在 BIOS 里关闭。

以拯救者为例，开机快速按 F2 进入 BIOS，在 Security 选项卡里找到 Secure Boot 关闭。其他品牌快捷键可能不同。

### 准备空闲分区

在 Windows 磁盘管理中进行压缩卷操作，给 Ubuntu 留至少 **200G**。空间充裕的话可以多给，后面装 ROS、数据集等避免空间不够。

如果是双硬盘，还需要在 **C 盘留 500MB 左右的空闲空间** 用于保存 Ubuntu 的 EFI 系统引导。只有系统盘有引导分区，启动时才会出现系统选择界面，否则每次都要进 BIOS 手动切换。

### 准备 Ubuntu 系统镜像

在 [Ubuntu 官网](https://ubuntu.com/desktop) 下载 iso 文件，也可以走 [国内镜像站](https://launchpad.net/ubuntu/+cdmirrors)，下载速度更快。

下载前先确定用途。比如需要安装 ROS（不是 ROS2），Ubuntu 最高只能选 20.04，更新版本不兼容。提前检索所需软件对 Ubuntu 版本的支持情况。

### 制作系统安装 U 盘

推荐使用 [Rufus](https://rufus.ie/zh/)，不限于 Ubuntu，其他系统的启动盘也能用。制作前备份 U 盘数据，过程会格式化。

Rufus 中分区类型选 **GPT**，文件系统选 **NTFS**。

## 双系统安装

### 调整启动项

插入 U 盘，进入 BIOS，将 U 盘设为第一启动项，重启进入 Ubuntu 安装界面。

### 选择语言

默认 English，下方可切换为简体中文。

初次接触 Linux 推荐中文，遇到问题方便排查。对 Linux 比较熟或英语 OK 的话推荐英文——英文是 Linux 的初始语言，中文偶尔有小 bug，比如 tty3 终端中会出现乱码。

虽然装完系统后还能添加语言，但初次选择的语言仍占主导。比如开始选了英文，后面改中文，部分界面仍保留英文，汉化不完全。

### 更新和其他软件

- 安装类型：不熟悉选正常安装（会多出一些小游戏等应用），熟悉的直接最小安装。
- 其他选项：**都不勾选**。安装时下载更新因国外源速度很慢，会卡在安装页面很久，建议装完换源后再更新。"为图形和无线硬件安装第三方软件"会安装不确定版本的 NVIDIA 驱动，可能不是你需要的版本，后续还要卸载，对后面的驱动安装会造成影响。但如果是虚拟机里安装就可以勾上。

### 安装类型

三种选项：

1. **共存**：也是双系统模式，但 bug 比较多
2. **清空硬盘安装**：适用于只装 Ubuntu 的机器
3. **自定义（Something else）**：多数人选这个，需要手动分区。网上配置教程很多，可参考 [CSDN](https://blog.csdn.net/Nismilesucc/article/details/123660591) 和 [知乎](https://zhuanlan.zhihu.com/p/268620595)

### 手动分区

先设置 EFI 分区。找到之前在 C 盘预留的空闲空间——**确认好盘符，选错会导致 Windows 文件丢失甚至系统损坏**。一般 C 盘为 nvme0，匹配大小确认。

双硬盘需在 C 盘单独设置 EFI 分区；单硬盘可不手动设，安装时会自动创建。

- **EFI 分区**：逻辑分区，用于 EFI 系统，约 500MB
- **swap**：在 Ubuntu 所在盘上，逻辑分区，用作交换空间（虚拟内存），大小根据物理内存决定
- **挂载点 `/`**：逻辑分区，Ext4，约 50G。存放 Ubuntu 系统文件，相当于 C 盘
- **挂载点 `/home`**：逻辑分区，Ext4，剩余空间全给 `/home`。你的文件、项目、配置都在这里
- **`/usr`**：视情况设定，空间不够可不设

安装启动引导器的位置选之前设置的 **EFI 分区**，不要选错。

### 安装收尾

后续按提示操作。用户名最好别出现中文，Linux 下中文路径和用户名容易出问题。Windows 同理。

安装完毕后提示重启，在开机 logo 界面按提示拔出 U 盘，回车重启。

## 视频教程

对上述流程不太清楚的话，可参考 [B 站视频教程](https://www.bilibili.com/video/BV1wo4y177Gk/)。除了分区部分视频是单硬盘、没有在 C 盘设置 EFI 系统分区外，其余操作基本一致。

## 如何删除 Ubuntu

安装和配置过程中可能会遇到问题需要重装，以下为完整删除方法：

1. 把启动项改回 Windows
2. 在 Windows 磁盘管理中删除所有 Ubuntu 分区
3. 清理 Windows EFI 分区中的 Ubuntu 引导项

第三步操作如下（参考 [双系统卸载教程](https://blog.csdn.net/qq_42257666/article/details/120721561) 后半部分，不需要额外下载软件，用磁盘管理即可）：

```bash
# Win+R 输入 cmd 打开命令行
diskpart
list disk
# 弹窗允许
# 选择系统盘
select disk 0
list partition
# 选择 Windows 的 EFI 分区，一般 200 多 M
select partition 1
# 分配盘符，不要和已有盘符冲突
assign letter=J
# 管理员方式运行记事本，打开 J 盘，进入 EFI 文件夹，删除其中 Ubuntu 文件夹
# 完成后移除盘符
remove letter=J
# 选中 Ubuntu 系统引导项所在分区，比如分区 5
select partition 5
delete partition override
```
