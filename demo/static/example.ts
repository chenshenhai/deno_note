import { cwd, } from "deno";
import { Server } from "./../framework/index.ts";
import staticServe from "./lib/static.ts";

const app = new Server();
const addr = "127.0.0.1:3001";
const baseDir = [cwd(), "public"].join("/");

app.use(staticServe(baseDir));

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});