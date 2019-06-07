#!/usr/bin/env deno --allow-run --allow-net
import { test, runTests } from "https://deno.land/x/testing/mod.ts";
import { assert, equal } from "https://deno.land/x/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const run = Deno.run;

const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer;

async function startHTTPServer() {
  httpServer = run({
    args: ["deno", "run", "--allow-net", "--allow-read",  "./test_server.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  const bufReader = new BufferReader(buffer);
  const line = await bufReader.readLine();
  equal("listening on 127.0.0.1:3001", line)
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout.close();
}

test(async function server() {
  try {
    // 等待服务启动
    await startHTTPServer();
    const res1 = await fetch(`${testSite}/static-file/js/index.js`);
    const result1 = await res1.text();
    assert(equal(result1, `console.log("hello world!");`));

    const res2 = await fetch(`${testSite}/static-file/css/index.css`);
    const result2 = await res2.text();
    assert(equal(result2, `body {background: #f0f0f0;}`));

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