import { listen, Conn } from "deno";
import { Request, Req } from "./mod.ts";
import { Response, Res } from "./response.ts";
import { Ctx, Context } from "./context.ts";

export class Server {
  private middlewares: Function[];
  private context: {};

  constructor() {
    this.middlewares = [];
    this.context = {};
  }

  private pushMiddleware(fn: Function): void{
    this.middlewares.push(fn);
  }

  public use(fn: Function): void {
    this.pushMiddleware(fn);
  }

  private createCtx(req: Req, res: Res): Ctx {
    const context = new Context(req, res);
    this.context = context;
    return context;
  }

  private callback() {
    const that = this;
    const handleRequest = async (conn: Conn) => {
      const req: Req = new Request(conn);
      const res: Res = new Response(conn, req);
      await req.init();
      const ctx = that.createCtx(req, res);
      const middlewares = that.middlewares;
      if (res.getEndStatus() !== true) {
        if (Array.isArray(middlewares) === true && middlewares.length > 0) {
          for (let idx = 0; idx < middlewares.length; idx++) {
            const cb = middlewares[idx];
            if (res.getEndStatus() === true) {
              break;
            }
            try {
              if (typeof cb === "function") {
                cb(ctx);
              }
            } catch (err) {
              that.onError(err);
            }
            if (idx + 1 >= middlewares.length) {
              res.end();
              break;
            }   
          }
        } else {
          res.end();
        }
      }
    };
    return handleRequest;
  }

  private onError(err: Error) {
    console.log(err);
  }

  private async loop(conn: Conn): Promise<void> {
    try {
      const handleRequest = this.callback();
      await handleRequest(conn);
    } catch(err) {
      this.onError(err);
      conn.close();
    }
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
        this.loop(conn);
      }
    } catch (error) {
      err = error;
      this.onError(err);
    }
  }
}