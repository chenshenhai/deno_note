import { Server } from "./mod.ts";

const addr = "127.0.0.1:3001"

const server = new Server();
server.createServer(async ctx => {
  const gen = await ctx.req.getGeneral();
  const headers = await ctx.req.getHeaders();
  const bodyStream = await ctx.req.getBodyStream();
  const headerObj = {};
  for (const key of headers.keys()) {
    headerObj[key] = headers.get(key);
  }
  ctx.res.setBody(`${JSON.stringify({
    general: gen,
    headers: headerObj,
    body: new TextDecoder().decode(bodyStream)
  })}`);
  ctx.res.setStatus(200);
  await ctx.res.flush();
}) 
server.listen(addr, function() {
  console.log('the server is starting');
})
