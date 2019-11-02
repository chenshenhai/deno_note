# 单元测试进阶

## 前言

上一篇文章中讲述了 `Deno` 单元测试的实现，测试的功能也比较简单，就是是简单的同步加法和异步加法的测试。但是现实的项目中的单元测试不是简单`异步方法`或者`同步方法` 的测试，有时候还要涉及到调用服务接口等测试处理。

本篇主要是讲述在`Deno`中，对一个HTTP的单元测试

## 实现步骤

- 利用`Deno`的`run`模块启动HTTP服务
- 单元测试里延迟执行，等待服务启动后执行单元测试
- 单元测试后关闭HTTP服务

## 具体例子


### demo地址
[https://github.com/chenshenhai/deno-note/tree/master/demo/testing_progress](https://github.com/chenshenhai/deno-note/tree/master/demo/testing_progress)

- 服务代码模块 `./demo/testing_progress/server.ts`

```js
function createResponse (): Uint8Array {
  const bodyStr = "hello world";
  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const resHeaders = [
    `HTTP/1.1 200`,
    `content-length: ${bodyStr.length}`,
    CRLF
  ];
  const ctxHeader = encoder.encode(resHeaders.join(CRLF));
  const ctxBody = encoder.encode(bodyStr);
  const data = new Uint8Array(ctxHeader.byteLength + ctxBody.byteLength);
  data.set(ctxHeader, 0);
  data.set(ctxBody, ctxHeader.byteLength);
  return data;
}

async function response(conn: Deno.Conn) {
  const ctx = createResponse();
  await conn.write(ctx);
  conn.close();
}

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

async function server(opts: Deno.ListenOptions) {
  const listener = Deno.listen(opts);
  console.log("listening on", `${opts.hostname}:${opts.port}`);
  while (true) {
    const connection = await listener.accept();
    response(connection);
  }
}

server(opts);
```

- 测试代码 `./demo/testing_progress/test.ts`

```js
#!/usr/bin/env deno run --allow-run --allow-net
import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import { assert, equal } from "https://deno.land/std/testing/asserts.ts";

const decoder = new TextDecoder();
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer;

async function startHTTPServer() {
  httpServer = Deno.run({
    args: ["deno", "run", "--allow-net", "./server.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  const chunk = new Uint8Array(2);
  await buffer.read(chunk);
  console.log("http server is starting");
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout.close();
}

test(async function server() {
  try {
    // 等待服务启动
    await startHTTPServer();
    const res = await fetch(testSite);
    const text = await res.text();
    assert(equal(text, "hello world"));
    // 关闭测试服务
    closeHTTPServer();
  } catch (err) {
    // 关闭测试服务
    closeHTTPServer();
    throw new Error(err);
  }
});

// 启动测试
runTests();
```

### 执行单元测试

```sh
## --allow-run 是直接允许 执行子进程脚本
## --allow-net 是直接允许 启动网络服务
deno test.ts --allow-run --allow-net 
```

![deno-note-testing_progress](https://user-images.githubusercontent.com/8216630/51621138-d1e7be00-1f6e-11e9-8edd-cc542b47b07d.jpg)
