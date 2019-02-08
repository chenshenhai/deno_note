import { listen, Conn, exit } from "deno";
import { Context } from "./../server/context.ts";
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
      compose(middlewares)(ctx).then(function() {
        ctx.res.flush();
      }).catch(function(err){
        that._onError(err, ctx);
      })
    }); 
    server.listen(addr, function() {
      console.log('the server is starting');
    })
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