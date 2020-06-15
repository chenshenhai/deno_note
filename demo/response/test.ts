#!/usr/bin/env deno run --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.56.0/testing/asserts.ts";
import {BufferReader} from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let textServer: Deno.Process;
let jsonServer: Deno.Process;;

async function startTextServer() {
  textServer = run({
    cmd: [
      Deno.execPath(),
      "run",
      "--allow-net",
      "./demo/response/test_server_text.ts",
      "--",
      ".",
      "--cors"
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | null = textServer.stdout as (Deno.Reader & Deno.Closer) | null;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
  } else {
    throw Error('Testing server started failfully!')
  }
}

async function closeTextServer() {
  textServer.close();
  await Deno.readAll(textServer.stdout!);
  const stdout = textServer.stdout as Deno.Reader & Deno.Closer | null;
  stdout!.close();
}

async function startJSONServer() {
  jsonServer = run({
    cmd: [
      Deno.execPath(),
      "run",
      "--allow-run",
      "--allow-net",
      "./demo/response/test_server_json.ts",
      "--",
      ".",
      "--cors"
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | null = jsonServer.stdout as (Deno.Reader & Deno.Closer) | null;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
  } else {
    throw Error('Testing server started failfully!');
  }
}

async function closeJSONServer() {
  jsonServer.close();
  await Deno.readAll(jsonServer.stdout!);
  const stdout = jsonServer.stdout as Deno.Reader & Deno.Closer | null;
  stdout!.close();
}

test('serverTextResponse', async function() {
  try {
    // 等待服务启动
    await startTextServer();
    const res = await fetch(`${testSite}`);
    const text = await res.text();
    const acceptResult = "hello world";
    assertEquals(text, acceptResult);
    
  } finally {
    // 关闭测试服务
    await closeTextServer();
  }
});


test('serverJSONResponse', async function() {
  try {
    // 等待服务启动
    await startJSONServer();
    const res = await fetch(`${testSite}`);
    const json = await res.json();
    const acceptResult = {
      "data": "helloworld"
    };
    assertEquals(json, acceptResult);
  } finally {
    // 关闭测试服务
    await closeJSONServer();
  }
});
