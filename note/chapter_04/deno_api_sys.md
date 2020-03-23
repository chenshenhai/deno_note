# Deno系统API

## API 使用方式

- `Deno.env()` 是输出环境变量
  - 例如Linux或Mac系统中，就有环境变量 `HOME`、`PWD`、`SHELL`等等
- `Deno.isTTY()` 判断是否在 terminal 控制台
  - 输出是否有标准输入，标准输出和标准错误
- `Deno.pid` 输出当前进程ID

```js

// deno --allow-env os.ts

// 环境变量信息
const _env = Deno.env();
console.log(_env);
// Linux export: { HOME:'...', PWD:'...', SHELL:'...',  }

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