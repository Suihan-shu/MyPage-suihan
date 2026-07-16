---
layout: post
title: "WSL2 开发环境配置笔记"
date: 2026-07-01 15:00:00 +0800
categories: ["Tools & Resources"]
tags: ["WSL2", "CUDA", "PyTorch", "ROS2", "Ubuntu"]
description: "WSL2 下 CUDA 13、cuDNN、Miniconda、PyTorch、ROS2 Jazzy 环境配置记录。"
lang: zh
series_key: dev-env-setup
series_order: 2
toc:
  sidebar: left
giscus_comments: true
---

## WSL2 基础操作

删除 WSL 发行版：

```bash
wsl --unregister Ubuntu-24.04
```

常用命令：

```bash
wsl --list          # 查看已安装的发行版
wsl -s Ubuntu-24.04 # 设为默认
```

在 Windows 安装 WSL 后，可选择 Linux 的不同发行版。VSCode 安装 WSL 扩展即可远程连接。

### 编译工具链

```bash
sudo apt install build-essential
```

### 图形界面（可选）

目前的 WSL2 已自带 WSLg，安装完成后可直接打开图形化程序：

```bash
sudo apt update
sudo apt install ubuntu-desktop
nautilus .          # 测试文件管理器
gnome-terminal .    # 测试原生终端
```

输入 `firefox` 打开浏览器，输入 `nautilus` 打开文件管理器，输入 `gnome-terminal` 打开 Linux 原生终端。在 gnome-terminal 的 Edit → Preferences 中可调整终端背景色、文本大小等。

## CUDA 配置

WSL2 下无需在 Linux 中单独安装显卡驱动，复用 Windows 的驱动即可。

```bash
nvidia-smi
```

输出左上角显示的是支持的最高 CUDA 版本。如果版本不够，需要先在 Windows 下更新显卡驱动。

![nvidia-smi 输出](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/wsl2-dev-environment/wsl2-dev-environment-nvidia-smi.png)

### 安装 CUDA Toolkit

去 [NVIDIA CUDA 下载页面](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network) 选择对应 WSL-Ubuntu 版本，复制命令执行：

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-0
```

### 配置环境变量

```bash
sudo vim ~/.bashrc
```

按 `i` 进入编辑模式，在末尾添加：

```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda-13.0/lib64
export PATH=$PATH:/usr/local/cuda-13.0/bin
export CUDA_HOME=$CUDA_HOME:/usr/local/cuda-13.0
```

按 `Esc` 退出编辑模式，`:wq` 保存退出。`source ~/.bashrc` 刷新环境变量后验证：

```bash
nvcc -V
```

![nvcc 版本信息](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/wsl2-dev-environment/wsl2-dev-environment-nvcc-version.png)

## 安装 cuDNN

[cuDNN 下载页面](https://developer.nvidia.com/cudnn-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=24.04&target_type=deb_local)，注意选择与 CUDA 版本匹配的：

```bash
wget https://developer.download.nvidia.com/compute/cudnn/9.16.0/local_installers/cudnn-local-repo-ubuntu2404-9.16.0_1.0-1_amd64.deb
sudo dpkg -i cudnn-local-repo-ubuntu2404-9.16.0_1.0-1_amd64.deb
sudo cp /var/cudnn-local-repo-ubuntu2404-9.16.0/cudnn-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cudnn9-cuda-13
```

验证：

```bash
ls /usr/lib/x86_64-linux-gnu/libcudnn*
```

## 安装 Miniconda

[Miniconda 官方安装指南](https://www.anaconda.com/docs/getting-started/miniconda/install#linux-terminal-installer)

```bash
wget -P /tmp https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash /tmp/Miniconda3-latest-Linux-x86_64.sh
```

创建虚拟环境：

```bash
conda create -n testenv python=3.12
conda activate testenv
```

## 安装 PyTorch

去 [PyTorch 官网](https://pytorch.org/get-started/locally/) 获取对应版本的安装命令：

```bash
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu130
```

## VPN 代理配置

在 `%USERPROFILE%\.wslconfig` 中添加或修改以下内容（没有该文件则新建）：

```ini
[wsl2]
networkingMode=mirrored      # 镜像模式（推荐）
dnsTunneling=true            # DNS 隧道，解决部分网络问题
firewall=true                # 启用防火墙集成
autoProxy=true               # 自动同步 Windows 代理设置
```

如果改成了 mirrored 模式，`localhostForwarding` 会失效，应删除该配置项，否则启动时会报：

> wsl: 使用镜像网络模式时，wsl2.localhostForwarding 设置无效

![WSL 网络设置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/wsl2-dev-environment/wsl2-dev-environment-wsl-network-settings.png)

Clash 需要开启 TUN 模式，且 TUN Stack 设为 **System**：

![Clash TUN 设置](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/wsl2-dev-environment/wsl2-dev-environment-clash-tun-system.png)

测试：

```bash
wget www.google.com
```

![wget 测试结果](https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USERNAME/Blog-assets@main/wsl2-dev-environment/wsl2-dev-environment-wget-test.png)

## 安装 ROS2

参考 [ROS2 Jazzy 官方文档](https://docs.ros.org/en/jazzy/Installation/Ubuntu-Install-Debs.html)。

### 配置软件源

```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
```

安装 ros2-apt-source 软件包，为系统配置 ROS2 软件仓库。当新版本发布到 ROS 仓库时，仓库配置会自动更新。

```bash
sudo apt update && sudo apt install curl -y
export ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest | grep -F "tag_name" | awk -F\" '{print $4}')
curl -L -o /tmp/ros2-apt-source.deb "https://github.com/ros-infrastructure/ros-apt-source/releases/download/${ROS_APT_SOURCE_VERSION}/ros2-apt-source_${ROS_APT_SOURCE_VERSION}.$(. /etc/os-release && echo ${UBUNTU_CODENAME:-${VERSION_CODENAME}})_all.deb"
sudo dpkg -i /tmp/ros2-apt-source.deb
```

### 安装开发工具

```bash
sudo apt update && sudo apt install ros-dev-tools
```

### 安装 ROS2

桌面安装（推荐）：含 ROS、RViz、演示、教程：

```bash
sudo apt upgrade
sudo apt install ros-jazzy-desktop
```

ROS-Base 安装（精简）：仅通信库、消息包、命令行工具，无 GUI 工具：

```bash
sudo apt install ros-jazzy-ros-base
```

### 测试

每个新开的 shell 需要先执行：

```bash
source /opt/ros/jazzy/setup.bash
```

终端 1：

```bash
source /opt/ros/jazzy/setup.bash
ros2 run demo_nodes_cpp talker
```

终端 2：

```bash
source /opt/ros/jazzy/setup.bash
ros2 run demo_nodes_py listener
```

listener 能收到 talker 的消息即安装成功。

### 卸载

```bash
sudo apt remove ~nros-jazzy-* && sudo apt autoremove
sudo apt remove ros2-apt-source
sudo apt update
sudo apt autoremove
sudo apt upgrade
```

## 参考资料

- [超详细 WSL2 安装深度学习环境 (CUDA + PyTorch)](https://blog.csdn.net/imok1234567/article/details/136820228)
- [WSL + VSCode 生产力环境配置](https://blog.csdn.net/yanbober/article/details/138245581)
- [在 WSL2 中使用 Clash 代理](https://blog.east.monster/2022/10/05/clash-config-in-wsl/)
- [为 WSL2 一键设置代理](https://zhuanlan.zhihu.com/p/153124468)
- [WSL2-Ubuntu 安装 CUDA + cuDNN + Anaconda + PyTorch](https://blog.csdn.net/u014451778/article/details/146075238)
