import { Server } from "./mod.ts";

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

const server = new Server();
server.createServer(async ctx => {
  const gen = await ctx.req.getGeneral();
  const headers = await ctx.req.getHeaders();
  const bodyStream = await ctx.req.getBodyStream();
  const headerObj = {};
  for (const key of headers.keys()) {
    headerObj[key] = headers.get(key);
  }
  // 把请求头信息全部打印出来
  ctx.res.setBody(`${JSON.stringify({
    general: gen,
    headers: headerObj,
    body: new TextDecoder().decode(bodyStream)
  })}`);
  ctx.res.setStatus(200);
  await ctx.res.flush();
}) 
server.listen(opts, function() {
  console.log('the server is starting');
})
