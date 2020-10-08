#!/usr/bin/env run deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.73.0/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

const testSite = "http://127.0.0.1:3001";

let httpServer: Deno.Process;

async function delay(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  });
}


// 启动测试服务
async function startHTTPServer() {
  httpServer = run({
    cmd: [Deno.execPath(), "run", "--allow-net", "./demo/web_router/test_server.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | null = httpServer.stdout as (Deno.Reader & Deno.Closer) | null;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
  }
}

async function closeHTTPServer() {
  httpServer.close();
  await Deno.readAll(httpServer.stdout!);
  const stdout = httpServer.stdout as Deno.Reader & Deno.Closer | null;
  stdout!.close();
}

test('testWebRouter', async function() {
  try {
    // 等待服务启动
    await startHTTPServer();

    // const res1 = await fetch(`${testSite}/hello`);
    // const result1 = await res1.text();
    // assertEquals(result1, "page_hello");

    // await delay(100);
    // const res2 = await fetch(`${testSite}/foo`);
    // const result2 = await res2.text();
    // assertEquals(result2, "page_foo");

    // await delay(100);
    // const res3 = await fetch(`${testSite}/bar`);
    // const result3 = await res3.text();
    // assertEquals(result3, "page_bar");

    // await delay(100);
    const res4 = await fetch(`${testSite}/page/p001/user/u001`);
    const result4 = await res4.json();
    assertEquals(result4, {"pageId":"p001","userId":"u001"});
  } finally {
    // 关闭测试服务
    await closeHTTPServer();
  }
});
