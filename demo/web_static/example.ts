import { Application } from "./../web/mod.ts";
import { staticServe } from "./mod.ts";

const cwd = Deno.cwd

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}
const baseDir = [cwd(), "public"].join("/");

const staticMiddleware = staticServe(baseDir, {prefix: `/static-file`});

app.use(staticMiddleware);

app.listen(opts, function(){
  console.log(`listening on ${opts.hostname}:${opts.port}`);
});