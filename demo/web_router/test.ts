#!/usr/bin/env deno --allow-run --allow-net
import { test, assert, equal, runTests } from "https://deno.land/x/testing/mod.ts";
import { run } from "deno";
import { BufferReader } from "./../buffer_reader/mod.ts";

const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer;

async function startHTTPServer() {
  httpServer = run({
    args: ["deno", "--allow-net", "./test_server.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  const bufReader = new BufferReader(buffer);
  const line = await bufReader.readLine();
  assert.equal("listening on 127.0.0.1:3001", line)
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
    assert(equal(result1, "page_hello"));

    const res2 = await fetch(`${testSite}/foo`);
    const result2 = await res2.text();
    assert(equal(result2, "page_foo"));

    const res3 = await fetch(`${testSite}/bar`);
    const result3 = await res3.text();
    assert(equal(result3, "page_bar"));

    const res4 = await fetch(`${testSite}/page/p001/user/u001`);
    const result4 = await res4.json();
    assert(equal(result4, {"pageId":"p001","userId":"u001"}));
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