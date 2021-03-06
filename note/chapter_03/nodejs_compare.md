# Deno和Node.js

## Deno 特点

- 【安全】沙箱模式启动代码
    - 例如 启动时候加上`--allow-net` 保证限制第三方模块不发起网络请求。
- 【模块化】模块化系统类似 `golang`  
    - URL方式或者相对路径来引用文件
    - 模块都是在线资源，不依赖如同`npm`中心化的包管理
- 【特点】
    - `TypeScript` 为开发应用的基本语法，因为`TypeScript`是`JavaScript`语法的超集，意味着`Deno`同时能支持`JavaScript` 的语法

## Deno和Node.js区别

||Deno|Node.js|
|---|---|---|
|开发语言|Typescript\JavaScript|JavaScript|
|模块|url资源|npm|
|模块特点|在线资源，去中心化|npm 中心化|
|原生能力|比较基础，例如HTTP服务、文件系统需要依赖官方库|比较丰富，HTTP服务、文件系统都有|
