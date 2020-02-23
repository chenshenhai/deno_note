#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer: Deno.Process;

async function startHTTPServer() {
  httpServer = run({
    args: ["deno", "run", "--allow-net", "./demo/server/test_server.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer: Deno.ReadCloser|undefined = httpServer.stdout;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
  } else {
    throw Error('Testing server started failfully!');
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
    const res1 = await fetch(`${testSite}/hello`);
    const result = await res1.text();
    const expectResult = "hello server";
    assertEquals(result, expectResult);
  } finally {
    // 关闭测试服务
    closeHTTPServer();
  }
});