#!/usr/bin/env deno run --allow-run --allow-net

import { test, runTests } from "https://deno.land/x/testing/mod.ts";
import { assert, equal } from "https://deno.land/x/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const run = Deno.run;

const decoder = new TextDecoder();
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer;

async function startHTTPServer() {
  httpServer = run({
    args: ["deno", "run", "--allow-net", "./test_server.ts", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  const bufReader = new BufferReader(buffer);
  const line = await bufReader.readLine();
  equal("listening on 127.0.0.1:3001", line)
  console.log('\r\nstart http server\r\n')
}

function closeHTTPServer() {
  httpServer.close();
  httpServer.stdout.close();
  console.log('\r\nclose http server\r\n')
}

test(async function serverGetRequest() {
  try {
    // 等待服务启动
    await startHTTPServer();
    const res = await fetch(`${testSite}/page/test.html?a=1&b=2`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Content-test": "helloworld"
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
    });
    const json = await res.json();
    const acceptResult = {
      "general": {
        "method":"GET",
        "protocol":"HTTP/1.1",
        "pathname":"/page/test.html",
        "search":"a=1&b=2"
      },
      "headers":{
        "content-type":"application/json",
        "content-test":"helloworld",
        "host":"127.0.0.1:3001"
      }, 
      "body": "",
      "beforeFinish": false,
      "afterFinish": true,
    }
    assert(equal(json, acceptResult));
    // 关闭测试服务
    closeHTTPServer();
  } catch (err) {
    // 关闭测试服务
    closeHTTPServer();
    throw new Error(err);
  }
});


test(async function serverPostRequest() {
  try {
    // 等待服务启动
    await startHTTPServer();
    const res = await fetch(`${testSite}/page/test.html?a=1&b=2`, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: "formData1=1&formData1=2", // body data type must match "Content-Type" header
    });
    const json = await res.json();
    const acceptResult = {
      "general": {
          "method": "POST",
          "protocol": "HTTP/1.1",
          "pathname": "/page/test.html",
          "search": "a=1&b=2"
      },
      "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "host": "127.0.0.1:3001",
          "content-length": "23"
      },
      "body": "formData1=1&formData1=2",
      "beforeFinish": false,
      "afterFinish": true
    }
    assert(equal(json, acceptResult));
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