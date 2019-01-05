import { Server } from "./../framework/index.ts";
import { Route, Router } from "./index.ts";
const app = new Server();
const addr = "127.0.0.1:3001";

const router = new Router();

router.get("/hello", async function(ctx) {
  ctx.res.setBody("this is hello page");
});
router.get("/foo", async function(ctx) {
  ctx.res.setBody("this is foo page");
});
router.get("/bar", async function(ctx) {
  ctx.res.setBody("this is bar page");
});
router.get("/page/:pageId/user/:userId", async function(ctx) {
  const params = ctx.getData("router");
  ctx.res.setBody(`${JSON.stringify(params)}`);
});

app.use(router.routes());

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});