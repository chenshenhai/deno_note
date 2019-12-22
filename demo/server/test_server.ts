import { Server } from "./mod.ts";

const server = new Server();
server.createServer(async ctx => {
  ctx.res.setBody("hello server");
  ctx.res.setStatus(200);
  await ctx.res.flush();
});

const opts: Deno.ListenOptions = {
  hostname: "0.0.0.0",
  port: 3001
}

server.listen(opts, function() {
  console.log(`listening on ${opts.hostname}:${opts.port}\r\n`,);
})
