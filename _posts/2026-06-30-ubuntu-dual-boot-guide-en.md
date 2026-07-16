---
layout: post
title: "Ubuntu Dual Boot: A Practical Walkthrough"
date: 2026-06-30 20:30:00 +0800
categories: ["Tools & Resources"]
tags: ["Ubuntu", "Dual Boot", "Linux", "Windows"]
description: "A step-by-step guide to installing Ubuntu alongside Windows, from preparation to uninstallation."
lang: en
lang-ref: post-ubuntu-dual-boot-guide-01
series_key: dev-env-setup
series_order: 1
toc:
  sidebar: left
giscus_comments: true
---

## Preparation

### Disable BitLocker

BitLocker is Windows' disk encryption. Some laptops ship with it enabled — you'll see a padlock icon on the drive in File Explorer. Turn it off in Windows Security or Control Panel.

If you tinker with your machine often, keep BitLocker off. When your system crashes and you need to pull the drive for backup, BitLocker will demand a recovery key for every disk operation.

### Disable Secure Boot

Secure Boot is designed to prevent malicious software from tampering with system components. It also prevents non-Windows operating systems from booting. Head into BIOS and disable it.

On a Lenovo Legion, press F2 at boot, then find Secure Boot under the Security tab. Other brands may use a different key.

### Free Up Disk Space

In Windows Disk Management, shrink a volume to free at least **200 GB** for Ubuntu. Give it more if you have the space — datasets, ROS packages, and dependencies add up fast.

If you have two physical drives, also reserve about **500 MB** on the C: drive for the EFI boot partition. Without it, you won't get a boot menu at startup — you'll have to enter BIOS every time to switch OSes.

### Download the Ubuntu ISO

Download from the [official site](https://ubuntu.com/desktop) or use a [mirror](https://launchpad.net/ubuntu/+cdmirrors) for faster speeds.

Check software requirements before picking a version. For example, ROS (not ROS2) caps at Ubuntu 20.04 — newer versions aren't supported. Look up compatibility for the tools you need first.

### Create a Bootable USB

Use [Rufus](https://rufus.ie/). It handles bootable USB creation for Windows, Linux, and most other systems. Clean interface, no bloat.

**Back up your USB drive first** — the process formats it. In Rufus, set partition scheme to **GPT** and file system to **NTFS**.

## Installation

### Boot Order

Insert the USB, enter BIOS, and move the USB to the top of the boot order. Restart to enter the Ubuntu installer.

### Language Selection

Default is English. You can switch to simplified Chinese below.

If you're new to Linux, Chinese is friendlier for troubleshooting. If you're comfortable with English or already familiar with Linux, stick with English — it's Linux's native language and avoids quirks like garbled text in tty3 terminals with Chinese locale.

You can add languages after installation, but the initial choice remains dominant. Switching to Chinese later leaves some UI elements in English — localization isn't complete.

### Updates and Third-Party Software

- Installation type: Choose **Minimal** if you know your way around Linux (skips preinstalled games and bloat). Normal install is fine otherwise.
- Other options: **Uncheck both.** Downloading updates during install pulls from overseas servers and takes forever. Install first, switch to a local mirror, then update. The "third-party software for graphics and Wi-Fi" option installs an unknown NVIDIA driver version — you'll likely need to uninstall it later, and it can interfere with the driver you actually want. If you're installing in a VM, both options are safe to check.

### Installation Type

Three options:

1. **Install alongside Windows** — dual-boot in theory, but buggy in practice.
2. **Erase disk** — for a clean Ubuntu-only machine.
3. **Something else** — manual partitioning, what most people use. Plenty of guides online, see [CSDN](https://blog.csdn.net/Nismilesucc/article/details/123660591) and [Zhihu](https://zhuanlan.zhihu.com/p/268620595).

### Manual Partitioning

Start with the EFI partition. Find the free space reserved on the C: drive — **double-check the disk, picking the wrong one destroys Windows files or the entire system**. The C: drive is usually nvme0. Match by size.

Dual-drive systems need a separate EFI partition on C:. Single-drive setups can skip manual EFI — the installer handles it automatically.

- **EFI partition**: Logical, EFI System, ~500 MB
- **swap**: On the Ubuntu drive, Logical, swap area. Size it to match or slightly exceed physical RAM
- **`/` mount point**: Logical, Ext4, ~50 GB. Ubuntu system files — equivalent to C: drive
- **`/home` mount point**: Logical, Ext4, the remaining space. Your files, projects, and configs
- **`/usr`**: Optional. Skip if space is tight

Set the bootloader installation target to the **EFI partition** you just created. Don't point it elsewhere.

### Finishing Up

Follow the remaining prompts. Avoid Chinese characters in your username — Linux and CJK paths don't mix well. Same advice applies to Windows.

After installation, restart when prompted. At the manufacturer logo screen, remove the USB as instructed and press Enter.

## Video Guide

Prefer watching over reading? [This Bilibili video](https://www.bilibili.com/video/BV1wo4y177Gk/) covers the process. The partitioning section assumes a single drive without a separate C: drive EFI setup — everything else is the same.

## Removing Ubuntu

If something goes wrong during installation or configuration and you want to start over:

1. Switch boot order back to Windows
2. Delete all Ubuntu partitions in Windows Disk Management
3. Clean Ubuntu's boot entry from the Windows EFI partition

Step 3 in detail (see the [latter half of this guide](https://blog.csdn.net/qq_42257666/article/details/120721561) for screenshots — no extra software needed, just Disk Management and diskpart):

```bash
# Win+R, type cmd
diskpart
list disk
# Allow UAC prompt
# Select system drive
select disk 0
list partition
# Find Windows EFI partition, usually 200–300 MB
select partition 1
# Assign a drive letter not already in use
assign letter=J
# Open Notepad as admin, navigate to J:, enter EFI folder, delete the Ubuntu subfolder
# When done
remove letter=J
# Select the Ubuntu boot entry partition, e.g. partition 5
select partition 5
delete partition override
```
