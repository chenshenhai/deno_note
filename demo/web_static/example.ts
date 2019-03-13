import { Application } from "./../web/mod.ts";
import { staticServe } from "./mod.ts";

const cwd = Deno.cwd

const app = new Application();
const addr = "127.0.0.1:3001";
const baseDir = [cwd(), "public"].join("/");

const staticMiddleware = staticServe(baseDir, {prefix: `/static-file`});

app.use(staticMiddleware);

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});