# Linux系统下CLI原始功能实现

## 前言

在`deno@v0.9.0` 版本就已经支持了原生`CLI`能力，用 `deno install cli_name ./mod.ts` 就可以实现安装`mod.ts`脚本为系统`CLI`功能。本篇一开始写于 `deno@v0.3.0` 版本下，当时还不支持`deno install` 的能力，所以用`deno`写了比较原始的`Linux`系统下`CLI`的安装和使用能力。

`CLI`是`Command-Line Interface`的缩写，翻译过来就是`命令行界面`，是非图形的计算机操作界面。`CLI`的作用是用户直接操作键盘输入指令给计算机，让计算机完成对应的指令程序。

`Deno`原生的能力中，只有本身的`$HOME/.deno/bin/deno`是可操作的`CLI`，没有其他的实现自定义`CLI`的能力。对比于`Node.js`原生体系，`Node.js`原生能力就自带了实现`Linux`和`Windows`系统下自定义`CLI`的能力。

那么如果要实现主流系统下`CLI`工具要了解哪些知识点？
- `Linux`系统下`bin`工具的运行原理

这一篇就选取实现`Linux`系统下`CLI`功能实现来做例子。

### 实现原理

- 在`HOME`目录下创建`CLI`工具隐藏目录，例如`.deno_cli/`
- 在`.deno_cli/`目录下创建
  - `.deno_cli/src/` 源文件目录
  - `.deno_cli/bin/` 可执行文件目录
- 在源文件目录`.deno_cli/src/`下写入需要执行程序的源码文件
- 在可执行文件目录`.deno_cli/bin/` 下写入可执行文件的目录
- 对可执行文件的目录`.deno_cli/bin/`进行`chmod +x`权限赋予操作
- 设置环境变量

### 实现源码

#### 源码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/cli/install.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/cli/install.ts)

#### 源码讲解

```js
// deno --allow-all install.ts

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function readSrcFile(filePath: string): string {
  const buf = Deno.readFileSync(filePath);
  const context = decoder.decode(buf);
  return context;
}

async function install() {
  const encoder = new TextEncoder();

  // 初始化 Linux 主目录下的cli工具文件夹
  const HOME = Deno.env.get('HOME');
  const cliBaseDir = `${HOME}/.deno_cli`;
  const cliBinDir = `${cliBaseDir}/bin`;
  const cliSrcDir = `${cliBaseDir}/src`;
  try {
    // 如果原来 有目录 .deno_cli/
    // 就删除掉
    Deno.removeSync(cliBaseDir, {recursive: true});
  } catch (err) {
    console.log(err);
  }
  // 在HOME目录下创建CLI工具隐藏目录 .deno_cli/
  Deno.mkdirSync(cliBaseDir);
  // 创建目录 $HOME/.deno_cli/bin 目录
  Deno.mkdirSync(cliBinDir);
  // 创建目录 $HOME/.deno_cli/src 目录
  Deno.mkdirSync(cliSrcDir);
  

  // 在源文件目录.deno_cli/src/下写入需要执行程序的源码文件
  const cliSource = readSrcFile('./src/denocli.ts');
  const srcFilePath = `${cliSrcDir}/deno_cli.ts`;
  Deno.writeFileSync(srcFilePath, encoder.encode(cliSource));

  // 在可执行文件目录.deno_cli/bin/ 下写入可执行文件的目录
  const binFilePath = `${cliBinDir}/denocli`;
  const cliBinContext = `deno run ${srcFilePath}`;
  Deno.writeFileSync(binFilePath, encoder.encode(cliBinContext));

  // 对可执行文件的目录.deno_cli/bin/进行chmod +x权限赋予操作
  const execAuth = Deno.run({cmd: ["chmod", "+x", binFilePath]});
  await execAuth.status();
  execAuth.close();

  console.log("\r\n[INFO]: denocli is installed successfully!\r\n");
  // 执行成功后提示全局变量设置
  console.log(`
    export PATH=$PATH:${HOME}/.deno_cli/bin  >> ~/.bash_profile\r\n
    source  ~/.bash_profile\r\n
  `)
}

install();
```

### 执行例子

#### 安装上述 denocli 工具

```sh
deno example.ts --allow-all
```

![cli-001](../image/cli_002.jpg)


根据提示配置对应 `Linux` 系统中 `CLI` 工具的环境变量

#### 效果测试

```sh
## 执行 denocli
denocli
```

会出现以下结果，一个简单的 `Deno` Linux系统的`CLI`工具就大功告成！

![cli-002](../image/cli_002.jpg)
