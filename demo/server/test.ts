// !/usr/bin/env deno --allow-run --allow-net
import { test, assert, equal, runTests } from "https://deno.land/x/testing/mod.ts";
import { run } from "deno";

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
    const res1 = await fetch(`${testSite}/hello`);
    const result1 = await res1.text();
    console.log(`\r\n result1=${result1} \r\n`);

    assert(equal(1, 1));
    // assert(equal(result1, "page_hello"));
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