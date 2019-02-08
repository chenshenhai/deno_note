import { Application } from "./../mod.ts";


const app = new Application();
const addr = "127.0.0.1:3001";

app.use(async function(ctx, next) {
  console.log('action 001');
  ctx.res.setBody("hello world! -001");
  await next();
  console.log('action 006');
});

app.use(async function(ctx, next) {
  console.log('action 002');
  ctx.res.setBody("hello world! -002");
  ctx.res.setStatus(200);
  ctx.res.setFinish();
  await next();
  // throw new Error('hello this is testing error')
  console.log('action 005');
});

app.use(async function(ctx, next) {
  console.log('action 003');
  ctx.res.setBody("hello world! -003");
  await next();
  console.log('action 004');
});

app.listen(addr, function() {
  console.log("the web is starting")
});