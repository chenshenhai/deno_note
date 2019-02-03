import { listen, Conn, exit } from "deno";
import { Context } from "./context.ts";
import { compose } from "./compose.ts";

class Application {
  private _middlewares: Function[];
  private _context?: Context;

  constructor() {
    this._middlewares = [];
  }

  private _pushMiddleware(fn: Function): void{
    this._middlewares.push(fn);
  }

  public use(fn: Function): void {
    this._pushMiddleware(fn);
  }

  private _createContext(conn: Conn): Context {
    const _context = new Context(conn);
    this._context = _context;
    return _context;
  }

  private _callback() {
    const that = this;
    const handleRequest = async (conn: Conn) => {
      const ctx = that._createContext(conn);
      const _middlewares = that._middlewares;
      compose(_middlewares)(ctx).then(function(){
        ctx.res.end();
      }).catch(function(err) {
        that._onError(err)
      });
    };
    return handleRequest;
  }

  private _onError(err: Error) {
    console.log(err);
    const ctx = this._context;
    if (ctx instanceof Context) {
      ctx.res.setBody(err.stack);
      ctx.res.setStatus(500);
      ctx.res.end();
    } else {
      exit(1);
    }
  }

  private async _loop(conn: Conn): Promise<void> {
    const handleRequest = this._callback();
    await handleRequest(conn);
  }

  public async listen(addr: string, fn?: Function) {
    const listener = listen("tcp", addr);
    let err: Error = null;
    try {
      if (typeof fn === "function") {
        fn();
      }
      while (true) {
        const conn = await listener.accept();
        await this._loop(conn);
      }
    } catch (error) {
      err = error;
      this._onError(err);
    }
  }
}

export { Application };