import { Application } from "./../mod.ts";


const app = new Application();
const addr = "127.0.0.1:3001";

app.use(async function(ctx, next) {
  ctx.res.setBody("hello world!");
  ctx.res.setStatus(200);
});

app.listen(addr, function() {
  console.log("the web is starting")
});