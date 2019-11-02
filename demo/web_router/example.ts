import { Application } from "./../web/mod.ts";
import { Route, Router } from "./mod.ts";
const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

const router = new Router();

router.get("/index", async function(ctx) {
  ctx.res.setBody(`
  <ul>
    <li><a href="/hello">/hello</a></li>
    <li><a href="/foo">/foo</a></li>
    <li><a href="/bar">/bar</a></li>
    <li><a href="/page/p001/user/u002">/page/p001/user/u002</a></li>
    <li><a href="/page/p002/user/u_abcd">/page/p002/user/u_abcd</a></li>
  </ul>
  `);
  ctx.res.setHeader('content-type', 'text/html')
  ctx.res.setStatus(200);
});

router.get("/hello", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("this is hello page");
});
router.get("/foo", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("this is foo page");
});
router.get("/bar", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("this is bar page");
});
router.get("/page/:pageId/user/:userId", async function(ctx) {
  const params = ctx.getData("router");
  ctx.res.setStatus(200);
  ctx.res.setBody(`${JSON.stringify(params)}`);
});

app.use(router.routes());

app.use(async function(ctx, next) {
  console.log('action before');
  ctx.res.setBody("hello web_router!");
  await next();
  console.log('action after');
});


app.listen(opts, function(){
  console.log(`listening on ${opts.hostname}:${opts.port}`);
});