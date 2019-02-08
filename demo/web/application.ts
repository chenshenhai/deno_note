import { listen, Conn, exit } from "deno";
import { Context, SafeContext } from "./context.ts";
import { Server } from "./../server/mod.ts";
import { compose } from "./compose.ts";

class Application {
  private _middlewares: Function[];
  private _server?: Server;

  constructor() {
    this._middlewares = [];
    this._server = new Server();
  }

  public use(fn: Function): void {
    this._pushMiddleware(fn);
  }

  public async listen(addr: string, fn?: Function) {
    const that = this;
    const server = this._server;
    server.createServer(async function(ctx) {
      const middlewares = that._middlewares;
      
      try {
        const sctx = new SafeContext(ctx);
        await compose(middlewares)(sctx);
        const body = sctx.res.getBody();
        if (!(body && typeof body === "string" && body.length > 0)) {
          sctx.res.setBody("404 Not Found!");
        }
        await ctx.res.flush();
      } catch (err) {
        that._onError(err, ctx);
      }
    }); 
    server.listen(addr, fn);
  }

 
  private async _onError(err: Error, ctx: Context) {
    console.log(err);
    if (ctx instanceof Context) {
      ctx.res.setBody(err.stack);
      ctx.res.setStatus(500);
      await ctx.res.flush();
    } else {
      exit(1);
    }
  }

  private _pushMiddleware(fn: Function): void{
    this._middlewares.push(fn);
  }
}

export { Application };