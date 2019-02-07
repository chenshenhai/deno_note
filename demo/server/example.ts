import { createServer } from "./mod.ts";

const addr = "127.0.0.1:3001"
createServer(addr, async ctx => {
  await ctx.res.setBody("hello context.ts example");
  await ctx.res.setStatus(200);
  await ctx.res.write();
});
