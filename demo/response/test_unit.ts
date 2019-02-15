// !/usr/bin/env deno --allow-run --allow-net
import { test, assert, equal, runTests } from "https://deno.land/x/testing/mod.ts";
import { run } from "deno";

const decoder = new TextDecoder();
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let textServer;
let jsonServer;

async function startTextServer() {
  textServer = run({
    args: ["deno", "--allow-net", "./demo/response/test_server_text.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = textServer.stdout;
  const chunk = new Uint8Array(2);
  await buffer.read(chunk);
  console.log("\r\n The testing text_server has started \r\n");
}

function closeTextServer() {
  textServer.close();
  textServer.stdout.close();
  console.log("\r\n The testing text_server has closed \r\n");
}

async function startJSONServer() {
  jsonServer = run({
    args: ["deno", "--allow-net", "./demo/response/test_server_json.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = jsonServer.stdout;
  const chunk = new Uint8Array(2);
  await buffer.read(chunk);
  console.log("\r\n The testing json_server has started \r\n");
}

function closeJSONServer() {
  jsonServer.close();
  jsonServer.stdout.close();
  console.log("\r\n The testing json_server has closed \r\n");
}

test(async function serverTextResponse() {
  try {
    // 等待服务启动
    await startTextServer();
    const res = await fetch(`${testSite}`);
    const text = await res.text();
    const acceptResult = "hello world";
    assert(equal(text, acceptResult));
    // 关闭测试服务
    closeTextServer();
  } catch (err) {
    // 关闭测试服务
    closeTextServer();
    throw new Error(err);
  }
});


test(async function serverJSONResponse() {
  try {
    // 等待服务启动
    await startJSONServer();
    const res = await fetch(`${testSite}`);
    const json = await res.json();
    const acceptResult = {
      "data": "helloworld"
    };
    assert(equal(json, acceptResult));
    // 关闭测试服务
    closeJSONServer();
  } catch (err) {
    // 关闭测试服务
    closeJSONServer();
    throw new Error(err);
  }
});
