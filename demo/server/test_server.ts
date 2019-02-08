import { createServer } from "./mod.ts";

const addr = "127.0.0.1:3001"
createServer(addr, async ctx => {
  ctx.res.setBody("hello server.ts");
  ctx.res.setStatus(200);
  await ctx.res.flush();
});
