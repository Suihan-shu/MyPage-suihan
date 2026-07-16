# WSL配置

删除wsl

```bash
wsl --unregister Ubuntu-24.04
```

wsl --list：显示wsl列表

wsl -s Ubuntu-24.04：设置默认子系统

在windows安装WSL，可以选择Linux的不同发行版

然后可以在VScode 安装 WSL 扩展，之后就可以远程连接

安装所依赖的编译工具

```bash
sudo apt install build-essential
```

也可以考虑安装图形化界面(可以跳过)

```bash
sudo apt update
sudo apt install ubuntu-desktop
nautilus .			# 测试能否打开文件管理器
gnome-terminal .	# 测试能否打开原生终端

```

注：目前的WSL已经自带WSLg，安装完成后就可以打开各种图形化程序。例如输入firefox打开浏览器，输入nautilus打开文件管理器，输入gnome-terminal可打开Linux原生终端，如下图，在edit-preference中可更改终端背景色、文本大小等

## cuda配置

无需单独配置显卡驱动

nvidia-smi

![image-20251203204856085](./assets/image-20251203204856085.png)

左上角是支持的最高CUDA版本，这里安装的是13.0所以需要更新显卡驱动，才能起效

### 安装cuda

[CUDA Toolkit 13.0 Update 2 Downloads | NVIDIA Developer](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=deb_network)

找到对应WSL版本，复制命令并运行

```
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt-get update
sudo apt-get -y install cuda-toolkit-13-0
```

### 配置环境变量

```
sudo vim ~/.bashrc
```

i进入编辑模式，在末尾将以下代码复制进去，然后按esc推出编辑模式，输入:wq保存并退出 

```
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda-13.0/lib64
export PATH=$PATH:/usr/local/cuda-13.0/bin
export CUDA_HOME=$CUDA_HOME:/usr/local/cuda-13.0
```

 输入source ~/.bashrc刷新环境变量，输入nvcc -V查看cuda是否已经安装成功

![image-20251203205641276](./assets/image-20251203205641276.png)

## 安装cudnn

[cuDNN 9.16.0 下载 |NVIDIA 开发者](https://developer.nvidia.com/cudnn-downloads?target_os=Linux&target_arch=x86_64&Distribution=Ubuntu&target_version=24.04&target_type=deb_local)

要找到对应cuda版本的



```
wget https://developer.download.nvidia.com/compute/cudnn/9.16.0/local_installers/cudnn-local-repo-ubuntu2404-9.16.0_1.0-1_amd64.deb
sudo dpkg -i cudnn-local-repo-ubuntu2404-9.16.0_1.0-1_amd64.deb
sudo cp /var/cudnn-local-repo-ubuntu2404-9.16.0/cudnn-*-keyring.gpg /usr/share/keyrings/
sudo apt-get update
sudo apt-get -y install cudnn9-cuda-13
```

验证方式

```
ls /usr/lib/x86_64-linux-gnu/libcudnn*
```



## 安装Miniconda

[安装Miniconda - Anaconda](https://www.anaconda.com/docs/getting-started/miniconda/install#linux-terminal-installer)

```
wget -P /tmp https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh

bash /tmp/Miniconda3-latest-Linux-x86_64.sh
```

创建虚拟环境

```
conda create -n testenv python=3.12
conda activate testenv
```

验证安装

```
conda config --show
```



## 安装Pytorch

找到对应版本的pytorch[Get Started](https://pytorch.org/get-started/locally/)

```
pip3 install torch torchvision --index-url https://download.pytorch.org/w
```

## VPN配置

只需要在WSL settings中把网络模式设置成Mirrored即可

Clash 设置 Tun模式即可

![image-20251203171235327](./assets/image-20251203171235327.png)

可以使用以下命令进行测试

```
wget www.google.com
```

![image-20251203171417305](./assets/image-20251203171417305.png)

## 安装ROS2

[Ubuntu (deb packages) — ROS 2 Documentation: Jazzy documentation](https://docs.ros.org/en/jazzy/Installation/Ubuntu-Install-Debs.html)

安装需要的库

```
sudo apt install software-properties-common
sudo add-apt-repository universe
```

安装 ros2-apt-source 软件包，将为系统配置 ROS 2 软件仓库。当该软件包的新版本发布到 ROS 软件仓库时，仓库配置将自动更新。

```
sudo apt update && sudo apt install curl -y
export ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest | grep -F "tag_name" | awk -F\" '{print $4}')
curl -L -o /tmp/ros2-apt-source.deb "https://github.com/ros-infrastructure/ros-apt-source/releases/download/${ROS_APT_SOURCE_VERSION}/ros2-apt-source_${ROS_APT_SOURCE_VERSION}.$(. /etc/os-release && echo ${UBUNTU_CODENAME:-${VERSION_CODENAME}})_all.deb"
sudo dpkg -i /tmp/ros2-apt-source.deb
```

### 安装开发工具

```
sudo apt update && sudo apt install ros-dev-tools
```

### 安装ROS2

桌面安装（推荐）：ROS、RViz、演示、教程

```
sudo apt upgrade
sudo apt install ros-jazzy-desktop
```

ROS-Base安装（简陋）：通信库、消息包、命令行工具。无图形用户界面工具

```
sudo apt install ros-jazzy-ros-base
```

### 测试安装

在每个新开的shell上执行这个命令，才能访问ROS 2命令

```
source /opt/ros/jazzy/setup.bash
```

```
source /opt/ros/jazzy/setup.bash
ros2 run demo_nodes_cpp talker
```

```
source /opt/ros/jazzy/setup.bash
ros2 run demo_nodes_py listener
```

### 卸载ROS2

```
sudo apt remove ~nros-jazzy-* && sudo apt autoremove
sudo apt remove ros2-apt-source
sudo apt update
sudo apt autoremove
sudo apt upgrade # Consider upgrading for packages previously shadowed.
```

## 参考资料

[超详细wsl2安装深度学习环境2025年最新版(cuda11.8+torch2.2)-CSDN博客](https://blog.csdn.net/imok1234567/article/details/136820228)

[建议立刻将 WSL + VSCode 作为你的最强生产力环境，起飞吧_wsl vscode-CSDN博客](https://blog.csdn.net/yanbober/article/details/138245581)

[在 WSL2 中使用 Clash for Windows 代理连接 - East Monster 个人博客](https://blog.east.monster/2022/10/05/clash-config-in-wsl/)

[为 WSL2 一键设置代理 -](https://zhuanlan.zhihu.com/p/153124468)

[在WSL2-Ubuntu中安装CUDA12.8、cuDNN、Anaconda、Pytorch并验证安装_cuda 12.8 pytorch版本-CSDN博客](https://blog.csdn.net/u014451778/article/details/146075238)
