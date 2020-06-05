#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.56.0/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const run = Deno.run;
const test = Deno.test;

async function delay(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  });
}

const testSite = "http://127.0.0.1:3001";

let httpServer: Deno.Process;

async function startHTTPServer() {
  httpServer = run({
    cmd: [Deno.execPath(), "run", "--allow-net", "--allow-read",  "./demo/web_static/test_server.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
  }
  
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout && httpServer.stdout.close();
}

test('testWebStatic', async function() {
  try {
    // 等待服务启动
    await startHTTPServer();

    await delay(100);
    const res1 = await fetch(`${testSite}/static-file/js/index.js`);
    const result1 = await res1.text();
    assertEquals(result1, `console.log("hello world!");`);

    // await delay(100);
    // const res2 = await fetch(`${testSite}/static-file/css/index.css`);
    // const result2 = await res2.text();
    // assertEquals(result2, `body {background: #f0f0f0;}`);
  } finally {
    closeHTTPServer();
  }
});
