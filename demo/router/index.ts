import { Context, Req, Res } from "./../framework/index.ts";

interface Layer {
  methods: string;
  path: string;
  middleware: Function;
}

class RouteLayer implements Layer {
  public methods: string;
  public path: string;
  public middleware: Function;
  constructor(methods, path, middleware) {
    this.path = path;
    this.methods = methods;
    this.middleware = middleware;
  }
}

export interface Route {
  get: Function;
  post: Function;
  delete: Function;
  put: Function;
  patch: Function;
}

export class Router implements Route {

  private stack: Layer[];

  constructor() {
    this.stack = [];
  }

  private register(methods, path, middleware) {
    const layer = new RouteLayer(methods, path, middleware);
    this.stack.push(layer);
  }

  public get(path, middleware) {
    this.register("GET", path, middleware);
  }

  public post(path, middleware) {
    this.register("POST", path, middleware);
  }

  public delete(path, middleware) {
    this.register("DELETE", path, middleware);
  }

  public put(path, middleware) {
    this.register("PUT", path, middleware);
  }

  public patch(path, middleware) {
    this.register("PATCH", path, middleware);
  }

  public routes() {
    const stock = this.stack;
    return async function(ctx: Context) {
      const req: Req = ctx.req;
      const headers = req.getHeaders();
      const currentPath = headers["pathname"] || "";
      const method = req.getMethod();
      let route;
      for (let i = 0; i < stock.length; i++) {
        const item = stock[i];
        if (currentPath === item.path && item.methods.indexOf(method) >= 0) {
          route = item.middleware;
          break;
        }
      }

      if (typeof route === "function") {
        route(ctx);
        return;
      }
    };
  }
}
