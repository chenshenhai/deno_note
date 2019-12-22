#!/usr/bin/env deno --allow-run --allow-net
import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import { assertEquals, equal } from "https://deno.land/std/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const run = Deno.run;

async function delay(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  });
}

const testSite = "http://0.0.0.0:3001";

let httpServer;

async function startHTTPServer() {
  httpServer = run({
    args: ["deno", "run", "--allow-net", "--allow-read",  "./demo/web_static/test_server.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  const bufReader = new BufferReader(buffer);
  const line = await bufReader.readLine();
  equal("listening on 0.0.0.0:3001", line)
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout.close();
}

test(async function testWebStatic() {
  try {
    await delay(500)
    // 等待服务启动
    await startHTTPServer();
    const res1 = await fetch(`${testSite}/static-file/js/index.js`);
    const result1 = await res1.text();
    assertEquals(result1, `console.log("hello world!");`);

    const res2 = await fetch(`${testSite}/static-file/css/index.css`);
    const result2 = await res2.text();
    assertEquals(result2, `body {background: #f0f0f0;}`);
  } finally {
    closeHTTPServer();
  }
});
