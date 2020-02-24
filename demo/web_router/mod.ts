import { Context } from "./../web/mod.ts";

/**
 * 路由层接口
 */
interface Layer {
  method: string;
  path: string;
  pathRegExp: RegExp;
  middleware: Function;
  getParams: Function;
}

/**
 * 路由层
 */
class RouteLayer implements Layer {
  public method: string;  // 路由方法 GET|POST|PUT|PATCH
  public path: string;  // 路由路径规则
  public middleware: Function;  // 路由方法中间件
  public pathRegExp: RegExp;  // 路由路径正则
  private pathParamKeyList: string[]; // 路由解析动态参数关键字
  constructor(method: string, path: string, middleware: Function) {
    this.path = path;
    this.method = method;
    this.middleware = middleware;
    this.pathParamKeyList = [];
    this.pathRegExp = new RegExp(path);
    this.pathParamKeyList = [];
    this.initPathToRegExpConfig(path);
  }

  /**
   * 获取实例请求路径中关键字的数据
   * 例如 this.path = "page/:pid/user/:uid"
   *     actionPath =  "page/001/user/abc"
   * 返回  {pid: "001", uid: "abcs"}
   * @param actionPath {string}
   * @return {object}
   */
  public getParams(actionPath: string) {
    const result: {[key: string]: string} = {};
    const pathRegExp = this.pathRegExp;
    const pathParamKeyList: string[] = this.pathParamKeyList;
    if (Array.isArray(pathParamKeyList) && pathParamKeyList.length > 0) {
      const execResult = pathRegExp.exec(actionPath);
      pathParamKeyList.forEach(function(key, index){
        const val = execResult![index + 1];
        if (typeof val === "string") {
          result[key] = val;
        }
      });
    }
    return result;
  }

  /**
   * 将路由规则转成正则配置
   * @param path {string}
   * @return {RegExp}
   */
  private initPathToRegExpConfig(path: string) {
    const pathItemRegExp = /\/([^\/]{2,})/ig;
    const paramKeyRegExp = /^\/\:[0-9a-zA-Z\_]/i;
    const pathItems = path.match(pathItemRegExp);
    const pathParamKeyList: string[] = [];
    const pathRegExpItemStrList: string[] = [];
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

/**
 * 路由接口
 */
export interface Route {
  get: Function;  // 注册 GET 请求方法
  post: Function;  // 注册 POST 请求方法
  delete: Function;  // 注册 DELETE 请求方法
  put: Function;  // 注册 PUT 请求方法
  patch: Function;  // 注册 PATCH 请求方法
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
  private register(method: string, path: string, middleware: Function) {
    const layer = new RouteLayer(method, path, middleware);
    this._stack.push(layer);
  }

  /**
   * 注册 GET请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public get(path: string, middleware: Function) {
    this.register("GET", path, middleware);
  }

  /**
   * 注册 POST请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public post(path: string, middleware: Function) {
    this.register("POST", path, middleware);
  }

  /**
   * 注册 DELETE请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public delete(path: string, middleware: Function) {
    this.register("DELETE", path, middleware);
  }

  /**
   * 注册 PUT请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public put(path: string, middleware: Function) {
    this.register("PUT", path, middleware);
  }

  /**
   * 注册 PATCH请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public patch(path: string, middleware: Function) {
    this.register("PATCH", path, middleware);
  }

  /**
   * @return {Function} 返回路由顶级中间件
   */
  public routes() {
    const stack = this._stack;
    return async function(ctx: Context, next: Function) {
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
        // return;
      }
    };
  }
}
