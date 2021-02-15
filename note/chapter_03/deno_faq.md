# Deno常见问题点

## 版本变更问题

#### Deno@1.7.4 deno_std的迁移

后把 denoland/deno/std 签回到 denoland/deno_std仓库里


#### Deno@0.42.0 后暂时不支持 importmap 能力

[https://github.com/denoland/deno/pull/4934](https://github.com/denoland/deno/pull/4934)

#### Deno@0.42.0 重命名了很多API名称或调用方式

https://github.com/denoland/deno/releases/tag/v0.42.0


#### Deno@0.40.0 后安装Mac/Linux目录调整 

在 `Deno` 0.40.0 版本开始，安装目录从 `$HOME/.local/bin` 又改回到 `$HOME/.deno/bin` 下。


#### Deno@0.34.0后默认 TS strict mode

在 `Deno` 0.34.0 版本开始，默认 TS 严格模式 `strict mode`，如果工程代码里有不符合TS严格模式的，估计一开始跑起来会直接报错！

#### Deno安装最新版后一直都是0.25.0

在 `Deno` 0.26.0 版本开始，安装目录从 `$HOME/.deno/bin` 改成了 `$HOME/.local/bin` 下。

如果在 0.26.0 版本前安装过旧版本的 `Deno` ，可以查看一下环境变量的目录位置，改成新的变量地址试试看。


