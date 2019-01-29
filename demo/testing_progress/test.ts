import { test, assert, equal } from "https://deno.land/x/testing/mod.ts";
import { run } from "deno";

const testSite = "http://127.0.0.1:3001";
// 启动测试服务
const httpServer = run({
  args: ["deno", "--allow-net", "./server.ts", ".", "--cors"]
});

test(async function server() {
  // 延迟点时间，等待服务启动
  await new Promise(res => setTimeout(res, 1000));
  const res = await fetch(testSite);
  const text = await res.text();
  assert(equal(text, "hello world"));
  // 关闭测试服务
  httpServer.close();
});
