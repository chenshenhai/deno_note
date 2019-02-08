import { Application } from "./../web/mod.ts";
import { Route, Router } from "./mod.ts";
const app = new Application();
const addr = "127.0.0.1:3001";

const router = new Router();

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


app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});