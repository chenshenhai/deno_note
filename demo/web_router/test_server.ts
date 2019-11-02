import { Application } from "./../web/mod.ts";
import { Route, Router } from "./mod.ts";
const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

const router = new Router();

router.get("/hello", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("page_hello");
});
router.get("/foo", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("page_foo");
});
router.get("/bar", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("page_bar");
});
router.get("/page/:pageId/user/:userId", async function(ctx) {
  const params = ctx.getData("router");
  ctx.res.setStatus(200);
  ctx.res.setBody(`${JSON.stringify(params)}`);
});

app.use(router.routes());

app.listen(opts, function(){
  console.log(`listening on ${opts.hostname}:${opts.port}\r\n`,);
});