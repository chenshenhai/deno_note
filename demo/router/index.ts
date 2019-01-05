import { Ctx, Req, Res } from "./../framework/index.ts";

interface Layer {
  methods: string;
  path: string;
  pathRegExp: RegExp;
  middleware: Function;
  getParams: Function;
}

class RouteLayer implements Layer {
  public methods: string;
  public path: string;
  public middleware: Function;
  public pathRegExp: RegExp;
  private pathParamKeyList: string[];
  constructor(methods, path, middleware) {
    this.path = path;
    this.methods = methods;
    this.middleware = middleware;
    this.pathParamKeyList = [];
    this.pathRegExp = new RegExp(path);
    this.pathParamKeyList = [];
    this.initPathToRegExpConfig(path);
  }

  public getParams(actionPath: string) {
    const result = {};
    const pathRegExp = this.pathRegExp;
    const pathParamKeyList = this.pathParamKeyList;
    if (Array.isArray(pathParamKeyList) && pathParamKeyList.length > 0) {
      const execResult = pathRegExp.exec(actionPath);
      pathParamKeyList.forEach(function(key, index){
        const val = execResult[index + 1];
        if (typeof val === "string") {
          result[key] = val;
        }
      });
    }
    return result;
  }

  private initPathToRegExpConfig(path: string) {
    const pathItemRegExp = /\/([^\/]{2,})/ig;
    const paramKeyRegExp = /^\/\:[0-9a-zA-Z\_]/i;
    const pathItems: string[] = path.match(pathItemRegExp);
    const pathParamKeyList = [];
    const pathRegExpItemStrList = [];
    if (Array.isArray(pathItems)) {
      pathItems.forEach(function(item){
        if (typeof item === "string") {
          if (paramKeyRegExp.test(item)) {
            pathRegExpItemStrList.push(`\/([^\/]+?)`);
            const pathParamKey = item.replace(/^\/\:/ig, "");
            pathParamKeyList.push(pathParamKey);
          } else {
            pathRegExpItemStrList.push(item);
          }
        }
      });
    }
    const regExpStr = `^${pathRegExpItemStrList.join("")}[\/]?$`;
    const regExp = new RegExp(regExpStr, "i");
    this.pathParamKeyList = pathParamKeyList;
    this.pathRegExp = regExp;
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
    return async function(ctx: Ctx) {
      const req: Req = ctx.req;
      const headers = req.getHeaders();
      const currentPath = headers["pathname"] || "";
      const method = req.getMethod();
      let route;
      for (let i = 0; i < stock.length; i++) {
        const item: Layer = stock[i];
        if (item.pathRegExp.test(currentPath) && item.methods.indexOf(method) >= 0) {
          route = item.middleware;
          const pathParams = item.getParams(currentPath);
          ctx.setData("router", pathParams);
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
