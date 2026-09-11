---
title: '如何在WSL中丝滑开关代理'
publishDate: 'Sept 11, 2026'
updatedDate: 'Sept 11, 2026'
description: '在WSL中通过极简命令丝滑开关代理'
tags:
  - 折腾
language: 'Chinese'
heroImage: { src: 'https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/wsl-proxy/cover.png', inferSize: true }
---

## WSL代理痛点

我平时是将 WSL 的网络设置成 `Mirrored`，在使用过程中如果宿主机的代理状态发生改变（例如开/关系统代理），WSL 的代理状态并不会跟着改变，需要重启 WSL 才能生效，并且会有一个通知，让人十分烦躁。

原因是 WSL 官方的 `autoProxy` 机制本身不能在 WSL 已运行时无缝热更新代理。

![代理更改重启 WSL 通知](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/wsl-proxy/notice.png)

## 解决方案

如果想做到 **Windows 代理一改，WSL 马上跟着改，而且不再提示重启**，合适的办法是关闭 WSL 的 `autoProxy`，让 WSL 直接使用 Windows 上的代理端口，通过命令随时手动控制 WSL 是否走 Windows 系统代理，不需要重启 WSL，也不会有烦人的通知。

具体过程如下：

### Windows 中的配置

在 Windows 中打开：

```
C:\Users\<你的用户名>\.wslconfig
```

写入：

```ini
[wsl2]
networkingMode=mirrored
dnsTunneling=true
autoProxy=false
```

其中：
- `networkingMode=mirrored`：让 WSL 可以通过 127.0.0.1 访问 Windows 上的系统代理。
- `autoProxy=false`：关闭 WSL 自动同步 Windows 代理，避免出现“检测到 Http 代理更改，请重启 WSL”的提示。

保存后记得重启 WSL 让设置生效。

### WSL 中的配置

在 WSL 中打开：

```
nano ~/.bashrc
```

在文件最后添加：

```bash
# ============================================================
# WSL Manual Proxy Control
# ============================================================

# Windows 代理地址
WSL_PROXY_HOST="127.0.0.1"
WSL_PROXY_PORT="7890"

# 开启代理
proxy_on() {
    local proxy="http://${WSL_PROXY_HOST}:${WSL_PROXY_PORT}"

    export http_proxy="$proxy"
    export https_proxy="$proxy"
    export HTTP_PROXY="$proxy"
    export HTTPS_PROXY="$proxy"

    echo "WSL Proxy ON  -> $proxy"
}

# 关闭代理
proxy_off() {
    unset http_proxy
    unset https_proxy
    unset HTTP_PROXY
    unset HTTPS_PROXY
    unset all_proxy
    unset ALL_PROXY

    echo "WSL Proxy OFF -> DIRECT"
}

# 查看代理状态
proxy_status() {
    if [[ -n "$http_proxy" ]]; then
        echo "WSL Proxy: ON"
        echo "HTTP  : $http_proxy"
        echo "HTTPS : $https_proxy"
    else
        echo "WSL Proxy: OFF (DIRECT)"
    fi
}

# 快捷命令
alias pon='proxy_on'
alias poff='proxy_off'
alias pstat='proxy_status'
```

如果你的 Windows 代理端口不是 `7890`，修改：

```bash
WSL_PROXY_PORT="7890"
```

为实际端口即可。

保存后执行：

```bash
source ~/.bashrc
```

## 日常使用方法

开启 WSL 代理：

```bash
pon
```

此时支持 `http_proxy/https_proxy` 的程序会通过：

```
WSL → 127.0.0.1:7890 → Windows代理 → Internet
```

关闭代理、恢复直连：

```bash
poff
```

查看当前状态：

```bash
pstat
```

例如：

```bash
$ pon
WSL Proxy ON  -> http://127.0.0.1:7890

$ pstat
WSL Proxy: ON
HTTP  : http://127.0.0.1:7890
HTTPS : http://127.0.0.1:7890

$ poff
WSL Proxy OFF -> DIRECT
```

最终效果就是：Windows 系统代理怎么开关都不会影响 WSL，需要 WSL 走代理时执行 `pon`，需要直连时执行 `poff`，需要查看当前的代理状态时执行`pstat`。