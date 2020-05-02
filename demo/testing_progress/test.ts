#!/usr/bin/env deno run --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@v0.42.0/testing/asserts.ts";

const test = Deno.test;
const decoder = new TextDecoder();
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer: Deno.Process;

async function startHTTPServer() {
  httpServer = Deno.run({
    cmd: [Deno.execPath(), "run", "--allow-net", "./server.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  if (buffer) {
    const chunk = new Uint8Array(2);
    await buffer.read(chunk);
    console.log("http server is starting");
  }
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout && httpServer.stdout.close();
}

test(async function server() {
  try {
    // 等待服务启动
    await startHTTPServer();
    const res = await fetch(testSite);
    const text = await res.text();
    assertEquals(text, "hello world");
    // 关闭测试服务
    closeHTTPServer();
  } catch (err) {
    // 关闭测试服务
    closeHTTPServer();
    throw new Error(err);
  }
});

// 启动测试
Deno.runTests();