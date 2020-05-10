# Deno模块体系

## 前言

`Deno` 以 `TypeScript` 作为开发语法，模块就是以标准的`ES6`的`import/export`规范使用。摆脱了`Node.js`目前(`v11.x`)主流支持的`CommonJS`规范。在`Deno`使用中，虽然是把开发者的`TypeScript`源码编译成`JavaScript`，但是从语言使用层面直接做了编译能力，开发者只需要关心`TypeScript`语法的开发所需要的功能，不需要花太多精力关注怎么把`TypeScript`编译成`JavaScript`。

## 模块规范

### 术语称谓

> Use the term "module" instead of "library" or "package"
> For clarity and consistency avoid the terms "library" and "package". Instead use "module" to refer to a single JS or TS file and also to refer to a directory of TS/JS code.

根据官方标准模块风格的介绍 [https://github.com/denoland/deno_std](https://github.com/denoland/deno_std#use-the-term-module-instead-of-library-or-package)，`Deno`的模块建议使用名称术语 `module`，而不是 `library` 或 `package`。

### 模块风格规范

> 参考: deno 官方模块风格指南 [https://github.com/denoland/deno_std#style-guide](https://deno.land/style_guide.html)

- 使用名词术语 `module` 而不是 `lib` 或 `package`
- 如果需要一个入口文件，则建议使用`mod.ts`而不是`index.js`或`index.ts`
- 文件命名方式使用“下划线”`_`，例如`file_sys.ts`，不要使用“破折号”`-`
- 输出方最多是两个参数，如果参数太多，超出部分用对象的方式代替
- 使用标准代码格式化命令去检查代码格式`deno --fmt`

## 模块分类

### 1.原生模块
`Deno` 原生基础能力的模块，直接从`Deno`中引用，例如

```js
const { readFileSync, writeFileSync } = Deno
```

原生模块主要提供以下能力。

- 原生基础能力的类，例如： 文件操作模块 `readFileSync`、`writeFileSync`，网络操作的模块 `listen` 等。
- 原生基础能力的接口`interface`，例如：读写接口`Reader`、`Writer`、`Closer`，或者网络接口`Conn`等。

### 2.本地模块

就是本地开发时候，自己定义的 `TypeScript` 模块文件，直接用 `import` 从本地相对或者绝对路径引用，例如：

```js
import { Module1, Module2 } from "./mod/xxx.ts";
```

### 3.标准模块

`Deno`官方有个目标是 `Aims to be browser compatible.`，也就代表着模块也可以像浏览器一下，用js链接使用模块。例如:

```js
import { assertEquals } from "https://deno.land/std@v0.50.0/testing/asserts.ts";
```

同时`Deno`团队为了规范远程模块的使用，特地建立了`deno_std`作为官方远程模块的标准模块，代码仓库[https://github.com/denoland/deno_std](https://github.com/denoland/deno_std)。官方的说明如下：
> These modules do not have external dependencies and they are reviewed by the Deno core team. The intention is to have a standard set of high quality code that all Deno projects can use fearlessly.
> Contributions are welcome!

从官方了解到的信息可以总结如下
- 标准模块要按照推荐代码格式去规范
- 标准模块以 `https://deno.land/std/` 为URL开头
- 标准模块可以用`无版本`或`带版本号` URL链接使用
- 任何第三方都可以贡献代码，申请使用 `https://deno.land/std/` 成为标准模块，这个有点像Java的`maven` 官方管理。

### 其他远程模块

除了以上三种模块类型，最后一种模块类型，就是自行搭建远程HTTP服务，自己定义自己的远程模块，类似`Node.js`可以定义自己的私有或者共有`npm`源。

## 模块编译

`Deno` 官方提到`Deno`是一个  `TypeScript`运行环境，并不是直接的`runtime`，而是在`Deno`使用中，虽然是把开发者的`TypeScript`源码编译成`JavaScript`，然后调用`V8`去执行代码 。

因此，这里就有一个编译`TypeScript`的过程。`Deno`将开发者本地`TypeScript`源码、源码中URL引用的远程代码，一并下载并且编译到本地系统中，并且用`hash`命名编译后的`js`文件和`sourceMap`文件。

### 编译位置

在deno的安装目录`\.deno`下，有两个文件夹
- `\.deno\deps\*` 存放远程模块下载在本地和`golang`类似。
- `\.deno\gen\*` 存放本地`TypeScript`编译后的`hash`命名`js`文件和对应`sourceMap`文件。
