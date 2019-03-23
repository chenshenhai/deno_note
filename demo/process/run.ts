#!/usr/bin/env deno --allow-run --allow-net

const run = Deno.run;

const testSite = "http://127.0.0.1:3001";
// 启动测试服务

let httpServer;

httpServer = run({
  args: ["deno", "--allow-net", "./server.ts"]
});

setTimeout(() => {
  httpServer.close();
}, 1000 * 60)