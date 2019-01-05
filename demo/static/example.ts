import { cwd, } from "deno";
import { Server } from "./../framework/index.ts";
import staticServe from "./index.ts";

const app = new Server();
const addr = "127.0.0.1:3001";
const baseDir = [cwd(), "public"].join("/");

const staticMiddleware = staticServe(baseDir, {prefix: `/static-file`});

app.use(staticMiddleware);

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});