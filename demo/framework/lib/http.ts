import { listen, Conn } from "deno";
import Request from "./request.ts";
import Response from "./response.ts";

class Server {
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

  private createContext(req, res) {
    const context = Object.create(this.context);
    context.req = req;
    context.res = res;
    return context;
  }

  private callback() {
    const that = this;
    const handleRequest = async (conn: Conn) => {
      const req = new Request(conn);
      const res = new Response(conn);
      await req.init();
      const context = that.createContext(req, res);
      const middlewares = that.middlewares;
      if (res.getEndStatus() !== true) {
        if (middlewares && middlewares.length > 0) {
          for (let idx = 0; idx < middlewares.length; idx++) {
            const cb = middlewares[idx];
            if (res.getEndStatus() === true) {
              break;
            }
            try {
              if (typeof cb === "function") {
                cb(context);
              }
            } catch (err) {
              that.onError(err);
            }
            if (idx + 1 >= this.middlewares.length) {
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

  public async loop(conn: Conn): Promise<void> {
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

export default Server;