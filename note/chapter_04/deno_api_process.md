# Deno进程操作API

## API使用方式

- `Deno.run({ args:[], stdout: '' })`
  - `args` 为字符串数组，拼接起来是子进程的执行命令
  - `stdout` 是输出方式，可选。
    - 如果设置了管道`"piped"`，打印输出的信息将会在 `Deno.run({...}).stdout` 输出数据流
    - `stdout` 输出数据流需要进行读取 `await stdout.read(new Uint8Array(1024))`

### 使用例子

例子源码地址 
[https://github.com/chenshenhai/deno_note/blob/master/demo/process/](https://github.com/chenshenhai/deno_note/blob/master/demo/process/)

#### 开启一个子进程

```js
// 用子进程启动 HTTP 服务
const process = Deno.run({
  args: ["deno", "run", "--allow-net", "./server.ts"]
});

// 延时关闭HTTP服务
setTimeout(() => {
  process.close();
}, 1000 * 60)
```

#### 开启一个子进程同时用管道输出

```js

async function main() {
  const process: Deno.Process = Deno.run({
    args: ["deno", "run", "--allow-net", "./server.ts"],
    stdout: "piped",
  });
  const stdout: Deno.ReadCloser|undefined = process.stdout;
  if (stdout) {
    const chunk = new Uint8Array(1024);
    await stdout.read(chunk);
    console.log(`[process.stdout]: ${new TextDecoder().decode(chunk)}`)
  }

  setTimeout(() => {
    process.close();
    console.log('close process');
  }, 1000 * 60);
}


main();
```