import { Server } from "./mod.ts";

const opts: Deno.ListenOptions = {
  hostname: "0.0.0.0",
  port: 3001
}

const server = new Server();
server.createServer(async ctx => {
  ctx.res.setBody(`hello server!`);
  ctx.res.setStatus(200);
  await ctx.res.flush();
}) 
server.listen(opts, function() {
  console.log('the server is starting');
})
