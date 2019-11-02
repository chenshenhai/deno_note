# 快速安装

## 前言

从`Deno` 的官方介绍得知，目前还是处于很原始的阶段，还不适合用于生产环境，安装方式对比`Node.js` 来说还是比较原始。但是比起 2018.06 诞生的时候，目前安装的方式已经很方便了。

由于我在写本书过程中使用都是`Linux`环境，所以建议大家想跟着教程操作的时候，选择`Mac OS` 或 `Ubuntu`等`Unix`类型的系统操作。


- 官方提供`Deno` 安装引导仓库 [https://github.com/denoland/deno_install](https://github.com/denoland/deno_install)

## 安装方式


## Linux 系统

- 安装最新版本

```sh
curl -fsSL https://deno.land/x/install/install.sh
```

- 安装制定版本 (例如安装v0.17.0)

```sh
curl -fsSL https://deno.land/x/install/install.sh | sh -s v0.17.0
```

- 环境变量设置


需要在当前环境变量文件`.bash_profile`最后加入

```sh
## 注意: $HOME 是当前系统用户目录
export PATH=$HOME/.deno/bin:$PATH
```

- 验证

在命令窗口中执行 `deno version`，就会出现`Deno` 的版本已经依赖 `V8` 的版本

```sh
deno: 0.17.0
v8: 7.7.200
typescript: 3.5.1

```


## Windows 系统

- 安装 `PowerShell` 命令工具
- 在`PowerShell` 命令工具执行安装 `Deno` 命令


```sh
iwr https://deno.land/x/install/install.ps1 -useb | iex
```

> 注意: 
> PowerShell用iwr安装遇到 “请求被中止: 未能创建 SSL/TLS 安全通道” 问题时候
> 在命令行输入 [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

> 就可以解决问题了

![window_install_error](https://user-images.githubusercontent.com/8216630/53027772-8c9caa80-34a0-11e9-9597-85398fb3881c.jpg)

- 当出现以上问题
- 步骤一：先输入 `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`
- 步骤二：再安装Deno `iwr https://deno.land/x/install/install.ps1 -useb | iex`

![window_install_002](https://user-images.githubusercontent.com/8216630/53028675-45171e00-34a2-11e9-87c1-7f53a242a6b1.jpg)


