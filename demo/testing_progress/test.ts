#!/usr/bin/env deno run --allow-run --allow-net
import { test, runTests } from "https://deno.land/x/testing/mod.ts";
import { assert, equal } from "https://deno.land/x/testing/asserts.ts";

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