#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.59.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer: Deno.Process;

async function startHTTPServer() {
  httpServer = run({
    cmd: [Deno.execPath(), "run", "--allow-net", "./demo/hello/mod.ts"],
    stdout: "piped"
  });
}

async function closeHTTPServer() {
  httpServer.close();
  await Deno.readAll(httpServer.stdout!);
  const stdout = httpServer.stdout as Deno.Reader & Deno.Closer | null;
  stdout!.close();
}

async function sleep(time: number = 10): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}


test('hello/mod_test', async function() {
  try {
    // 等待服务启动
    await startHTTPServer();
    await sleep(1000);
    const res1 = await fetch(`${testSite}`);
    const result = await res1.text();
    const expectResult = "hello world!";
    assertEquals(result, expectResult);
  } finally {
    // 关闭测试服务
    await closeHTTPServer();
  }
});