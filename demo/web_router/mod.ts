interface Layer {
  method: string;
  path: string;
  pathRegExp: RegExp;
  middleware: Function;
  getParams: Function;
}

class RouteLayer implements Layer {
  public method: string;
  public path: string;
  public middleware: Function;
  public pathRegExp: RegExp;
  private pathParamKeyList: string[];
  constructor(method, path, middleware) {
    this.path = path;
    this.method = method;
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

/**
 * 路由中间件
 */
export class Router implements Route {

  private _stack: Layer[];

  constructor() {
    this._stack = [];
  }

  /**
   * 注册路由
   * @param method {string} 路由的方法名称
   * @param path {string} 路由路径，例如 /page/hello 或 /page/:pid/user/:uid
   * @param middleware {Function} 路由的执行方法 function(ctx, next) { //... }
   */
  private register(method, path, middleware) {
    const layer = new RouteLayer(method, path, middleware);
    this._stack.push(layer);
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
    const stack = this._stack;
    return async function(ctx, next) {
      const req = ctx.req;
      const gen = await req.getGeneral();
      const headers = await req.getHeaders();
      const currentPath = gen.pathname || "";
      const method = gen.method;
      let route;
      for (let i = 0; i < stack.length; i++) {
        const item: Layer = stack[i];
        if (item.pathRegExp.test(currentPath) && item.method.indexOf(method) >= 0) {
          route = item.middleware;
          const pathParams = item.getParams(currentPath);
          ctx.setData("router", pathParams);
          break;
        }
      }

      if (typeof route === "function") {
        await route(ctx, next);
        return;
      }
    };
  }
}
