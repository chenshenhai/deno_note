// !/usr/bin/env deno --allow-run --allow-net
import { test, assert, equal, runTests } from "https://deno.land/x/testing/mod.ts";
import { run } from "deno";

const decoder = new TextDecoder();
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer;

async function startHTTPServer() {
  httpServer = run({
    args: ["deno", "--allow-net", "./test_server.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  const chunk = new Uint8Array(2);
  await buffer.read(chunk);
  console.log("\r\n The testing text_server has started \r\n");
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout.close();
  console.log("\r\n The testing text_server has closed \r\n");
}


test(async function serverTextResponse() {
  try {
    // 等待服务启动
    await startHTTPServer();
    const res = await fetch(`${testSite}`);
    const text = await res.text();
    const acceptResult = "hello server.ts";
    assert(equal(text, acceptResult));
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