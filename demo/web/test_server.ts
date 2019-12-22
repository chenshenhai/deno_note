import { Application } from "./mod.ts";


const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

app.use(async function(ctx, next) {
  // console.log('action 001');
  ctx.res.setBody("hello world! middleware-001");
  await next();
  // console.log('action 006');
});

app.use(async function(ctx, next) {
  // console.log('action 002');
  ctx.res.setBody("hello world! middleware-002");
  ctx.res.setStatus(200);
  ctx.res.setFinish();
  await next();
  // throw new Error('hello this is testing error')
  // console.log('action 005');
});

app.use(async function(ctx, next) {
  // console.log('action 003');
  ctx.res.setBody("hello world! middleware-003");
  await next();
  // console.log('action 004');
});

app.listen(opts, function() {
  console.log(`listening on ${opts.hostname}:${opts.port}\r\n`,);
});