#!/usr/bin/env deno run --allow-run --allow-net

import { assertEquals, equal } from "https://deno.land/std@0.56.0/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

const decoder = new TextDecoder();
const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer: Deno.Process;

async function startHTTPServer() {
  httpServer = run({
    cmd: [
      Deno.execPath(),
      "run",
      "--allow-net",
      "./demo/request/test_server.ts",
      "--",
      ".",
      "--cors"
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | null = httpServer.stdout as (Deno.Reader & Deno.Closer) | null;
  if (buffer) {
    const bufReader: BufferReader = new BufferReader(buffer);

    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
    console.log('\r\nstart http server\r\n')
  } else {
    throw Error('Testing server started failfully!')
  }
}

async function closeHTTPServer() {
  if (httpServer) {
    httpServer.close();
    await Deno.readAll(httpServer.stdout!);
    const stdout = httpServer.stdout as Deno.Reader & Deno.Closer | null;
    stdout!.close();
  }
  console.log('\r\nclose http server\r\n')
}

test('serverGetRequest', async function() {
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
        "method": "GET",
        "protocol": "HTTP/1.1",
        "pathname": "/page/test.html",
        "search": "a=1&b=2"
      },
      "headers": {
        "content-type": "application/json",
        "content-test": "helloworld",
        "accept-encoding": "gzip, br",
        "user-agent": `Deno/${Deno.version.deno}`,
        "accept": "*/*",
        "host": "127.0.0.1:3001"
      },
      "body": "",
      "beforeFinish": false,
      "afterFinish": true
    }
    
    assertEquals(json, acceptResult);
  } finally {
    await closeHTTPServer();
  }
});


test('serverPostRequest', async function() {
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
      "general":{
        "method":"POST",
        "protocol":"HTTP/1.1",
        "pathname":"/page/test.html",
        "search":"a=1&b=2"
      },
      "headers":{
        "content-type":"application/x-www-form-urlencoded",
        "user-agent": `Deno/${Deno.version.deno}`,
        "accept":"*/*",
        "host":"127.0.0.1:3001",
        "content-length":"23",
        "accept-encoding": "gzip, br",
      },
      "body":"formData1=1&formData1=2",
      "beforeFinish":false,
      "afterFinish":true
    }
    
    assertEquals(json, acceptResult);
  } finally {
    await closeHTTPServer();
  }
});
