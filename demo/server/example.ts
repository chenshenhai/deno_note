import { Server } from "./mod.ts";

const addr = "127.0.0.1:3001"

const server = new Server();
server.createServer(async ctx => {
  ctx.res.setBody("hello context.ts example");
  ctx.res.setStatus(200);
  await ctx.res.flush();
}) 
server.listen(addr, function() {
  console.log('the server is starting');
})
