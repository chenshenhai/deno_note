# Deno系统API

## API 使用方式

更多详细信息可参考官方API文档 [https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.env](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.env)


- `Deno.env.get(name: string)` 是获取环境变量
  - 例如Linux或Mac系统中，就有环境变量 `HOME`、`PWD`、`SHELL`等等
  - 例如获取 `HOME` 就可以执行 `Deno.env.get("HOME")`
- `Deno.isTTY()` 判断是否在 terminal 控制台
  - 输出是否有标准输入，标准输出和标准错误
- `Deno.pid` 输出当前进程ID

```js

// deno --allow-env os.ts

// 环境变量信息
const env = Deno.env.get('HOME');
console.log(_env);
// Linux export: /Users/xxxxxx

// 判断是否在 terminal 控制台中
const _tty = Deno.isatty(0);
console.log(_tty);
// export: { stdin: true, stdout: true, stderr: true }
//  stdin: 是否为标准输入
//  stdout: 是否为标准输出
//  stderr: 是否为标准错误


const _pid = Deno.pid;
console.log(_pid);
// export: {number}进程ID
```