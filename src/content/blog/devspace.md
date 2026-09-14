---
title: '如何开启 Codex 无限火力并随时随地远程开发'
publishDate: 'Sept 14, 2026'
updatedDate: 'Sept 14, 2026'
description: '通过 MCP 插件实现通过网页端/桌面端 ChatGPT 额度随时随地修改代码/远程开发'
tags:
  - 折腾
language: 'Chinese'
heroImage: { src: 'https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/devspace/cover.png', inferSize: true }
---

## 方案介绍

目前节省 Codex 用量的方法主要有两类，一类是通过 Subagent 实现高级模型规划/审查，低级模型执行的协同模式，一类是通过 MCP 插件将修改代码的请求路由到 ChatGPT 网页端/桌面端，也就是本文要介绍的方案，原理是将 DevSpace MCP 服务通过 Cloudflare Tunnel 暴露成一个带 HTTPS 和 OAuth 认证的公网地址，供 ChatGPT 或其他 MCP 客户端连接。

下面以这些变量为例。请替换成自己的值：

```text
PUBLIC_HOST=devspace.example.com
DEVSPACE_PORT=7676
```

---

## 前置条件

- 一个已接入 Cloudflare 的域名 (可选，推荐有一个固定域名)
- Cloudflare 账号权限：创建 Tunnel、配置 DNS
- Node.js、npm，以及 DevSpace 所需的运行环境
- ChatGPT：能在 MCP/连接器设置中添加远程 MCP Server

本教程以 Debian 系 Linux 为例，Windows 用户请安装并使用 `git bash`（请尽量避免使用 Powershell）。

---

## 配置 Cloudflared 并创建 Tunnel

### 安装 Cloudflared：

```bash
sudo apt update
sudo apt install ca-certificates curl gnupg
sudo apt install cloudflared
cloudflared --version
```

### 登录授权

在运行 Tunnel 的环境中执行：

```bash
cloudflared tunnel login
```

浏览器会打开 Cloudflare 授权页面。选择对应账号和域名，完成授权后本机会生成证书文件。

### 创建 Tunnel

```bash
cloudflared tunnel create devspace
```

记下命令输出的 Tunnel UUID。凭据文件通常位于：

```text
~/.cloudflared/<TUNNEL_UUID>.json
```

### 绑定 DNS

把公网子域名指向 Tunnel：

```bash
cloudflared tunnel route dns devspace devspace.example.com
```

如果有第二台机器，应使用独立 Tunnel、独立子域名和独立 DevSpace owner token，例如：

```text
devspace.example.com   → 第一台机器
devspace2.example.com    → 第二台机器
```

不要让两台机器共用同一个本地 `auth.json` 或 owner token。

### 编写 config.yml

创建 `~/.cloudflared/config.yml`：

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /home/your-user/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: devspace.example.com
    service: http://127.0.0.1:7676
  - service: http_status:404
```

先验证配置：

```bash
cloudflared tunnel ingress validate
```

前台运行测试：

```bash
cloudflared tunnel --config ~/.cloudflared/config.yml run devspace
```

---

## 配置DevSpace

### 安装并初始化 DevSpace

```bash
# 确认 Node.js 和 npm
node --version
npm --version

# 安装 DevSpace
npm install -g @waishnav/devspace

# 在需要的项目目录初始化
cd ~/code/your-project
devspace init
```

初始化时 DevSpace 会询问使用 ChatGPT 还是 Coding Agents，这里我们选择 ChatGPT 就好；还会要求填写域名，这里使用之前在 cloudflared 配置的 Tunnel 中使用的域名 (不带 /mcp)。

- 服务监听地址为本机回环地址或本机可访问地址
- 端口使用 `7676`，或记下你实际使用的端口
- MCP 路径为 `/mcp`
- owner password/token 已生成并保存在本机安全位置

### allowedRoots 和 publicBaseUrl

在 DevSpace 配置中设置允许访问的项目目录，并声明公网基地址。字段名称可能随版本或配置方式略有差异，原则如下：

```yaml
# 示例结构，按你安装的 DevSpace 版本和你自己的需求对应调整
allowedRoots:
  - /home/your-user/code

publicBaseUrl: https://devspace.example.com
```

`allowedRoots` 决定 DevSpace 能访问哪些目录。尽量写具体工作区目录，不要直接放开整个根目录或用户 home 目录。

### 启动 DevSpace

```bash
devspace serve --port 7676
```

---

## 配置后端自启动服务

### 先确认 systemd 可用

```bash
ps -p 1 -o comm=
systemctl is-system-running
```

如果 PID 1 不是 `systemd`，先启用 WSL systemd。编辑 `/etc/wsl.conf`：

```ini
[boot]
systemd=true
```

然后在 Windows PowerShell 中重启 WSL：

```powershell
wsl --shutdown
```

重新进入 WSL 后再次确认 `systemctl`。

### cloudflared 服务

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

如果使用自定义配置，确认服务实际读取的是你的 `config.yml`。

查看日志：

```bash
sudo journalctl -u cloudflared -n 50 --no-pager
```

### DevSpace 服务

如果 DevSpace 通过 nvm 安装，systemd 通常找不到交互式 shell 里的 `node` 和 `devspace`。最稳妥的做法是使用绝对路径。

先找路径：

```bash
command -v node
command -v devspace
```

创建 `/etc/systemd/system/devspace.service`：

```ini
[Unit]
Description=DevSpace MCP server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/code/your-project
Environment=NODE_ENV=production
ExecStart=/home/your-user/.nvm/versions/node/<NODE_VERSION>/bin/devspace serve --port 7676
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

把 `ExecStart` 改成实际路径；上面 `<NODE_VERSION>` 只是占位符，不能原样使用。

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now devspace
sudo systemctl status devspace
```

查看日志：

```bash
sudo journalctl -u devspace -n 50 --no-pager
```

---

## 后端服务完整验证流程

### 查看服务状态

```bash
systemctl --no-pager --full status devspace cloudflared
```

### 确认端口监听

```bash
ss -ltnp | grep 7676
```

正常应看到类似：

```text
LISTEN 0 511 127.0.0.1:7676 0.0.0.0:* users:(("...",pid=...,fd=...))
```

### 测试本地 MCP

```bash
curl -i --max-time 5 http://127.0.0.1:7676/mcp
```

返回 `401 Unauthorized`，并提示 `Missing Authorization header`，通常说明 DevSpace 已经正常工作，只是请求没有携带 OAuth token。

### 测试公网链路

```bash
curl -i --max-time 10 https://devspace.example.com/mcp
```

公网也返回 DevSpace 的 `401`，而不是 `502`，说明链路已打通：

```text
公网
  ↓
Cloudflare DNS
  ↓
Cloudflare Tunnel
  ↓
127.0.0.1:7676
  ↓
DevSpace
```

---

## ChatGPT 中添加 MCP 服务

先在 ChatGPT 网页版设置中打开开发人员模式，然后添加新插件，示例如下：

![插件创建](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/devspace/plugin.png)

MCP Server URL 填：

```text
https://devspace.example.com/mcp
```

首次连接时按提示完成 OAuth/owner password 授权。

---

## 使用效果

完成上述配置之后，就可以随时随地打开 ChatGPT 的网页端/桌面端/手机客户端，会话调用你自己创建的插件进行远程开发，并且走 Chat 通道，不消耗 Codex 额度，愉快地使用无限火力吧！

---

## 常见问题

### 502 Bad Gateway

通常是 Tunnel 能连到 Cloudflare，但连不到本地 DevSpace。按顺序检查：

```bash
systemctl status devspace
ss -ltnp | grep 7676
curl -i http://127.0.0.1:7676/mcp
systemctl status cloudflared
```

同时确认 `config.yml` 中的端口、协议和路径正确：

```yaml
service: http://127.0.0.1:7676
```

### 401 Unauthorized

如果响应中有：

```text
Missing Authorization header
```

这通常不是故障，而是服务要求 OAuth 认证。只要本地和公网都能稳定返回 DevSpace 的 401，就说明服务和 Tunnel 基本正常。

### systemd 找不到 node 或 devspace

这是 nvm 环境最常见的问题。systemd 不会自动加载交互式 shell 配置。使用 `command -v` 找到绝对路径，并在 service 文件里使用绝对路径；修改后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl restart devspace
```

### 按 Ctrl+C 后服务消失

前台运行时按 Ctrl+C 会结束当前进程。测试完成后应使用 systemd、Windows 服务或任务计划程序托管它，而不是依赖一个打开的终端窗口。

### 后台运行后找不到进程

先看 systemd：

```bash
systemctl is-active devspace
systemctl is-active cloudflared
```

再看最近日志：

```bash
journalctl -u devspace -n 50 --no-pager
journalctl -u cloudflared -n 50 --no-pager
```

### ChatGPT 连不上 MCP URL

确认：

- URL 以 `/mcp` 结尾
- 使用的是公网 HTTPS 域名，而不是 `127.0.0.1`
- 公网 `curl` 返回的是 401 或 MCP 响应，不是 502/超时
- Tunnel、DNS 和 DevSpace 属于同一台目标机器
- 第二台机器使用了独立子域名、独立 Tunnel 和独立 owner token