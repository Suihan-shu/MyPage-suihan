# 设置WSL代理解决方案

设置WSL2为镜像模式在 C:\Users\<你的用户名>\.wslconfig 中添加或修改以下内容（如果没有此文件，创建即可）：

```
[wsl2]
networkingMode=mirrored		# 镜像模式（推荐）
dnsTunneling=true         	# DNS隧道（解决某些网络问题）
firewall=true            	# 启用防火墙集成
autoProxy=true          	# 自动同步Windows代理设置
```

如果修改为 mirrored 模式之后，此时 localhostForwarding 将无效，应删去此配置，否则在启动时候会报如下警告：
wsl: 使用镜像网络模式时，wsl2.localhostForwarding 设置无效

测试网络情况

```
wget www.google.com
```

clash需要打开TUN模式，而且设置成System

![image-20260623155730054](./assets/image-20260623155730054.png)
