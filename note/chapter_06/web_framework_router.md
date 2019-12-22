# 6.2 中间件-路由实现

## 前言

前一篇文章 [6.1 中间件式框架简单实现](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/01.md) 讲述了如何实现一个  `Deno`版 `Koa.js`。本篇就主要讲解，基于上述的中间件框架扩展的路由中间件。

## 实现过程

- 初始化路由实例 `const router = new Router`
- 注册路由请求信息缓存到实例中
  - 请求类型
  - 请求`path`规则
  - 处理请求`path`规则成正则
    - 当设置了 `path="page/:pid/user/:uid"`
    - 实际浏览器请求 `"page/001/user/abc"`
    - 解析出路由参数数据`{pid: "001", uid: "abcs"}`，方便后续存到`Context`缓存数据里
  - 对应的请求后中间件方法
- 注册的路由操作就是子中间件 `router.get('/xx/xx', function(){ })`
- 路由实例输出父中间件
  - 返回一个父中间件 `router.routes()`
  - 中间件里对每次请求进行遍历匹配缓存中注册的路由操作
  - 匹配上请求类型，路径就执行对应路由子中间件
- `app.use()` 路由实例返回的父中间件

如果觉得过程有点复杂，可以查看中间件路由精简版的实现 [《Koa.js设计模式-学习笔记》|koa-router 实现](https://github.com/chenshenhai/koajs-design-note/blob/master/note/chapter06/01.md)

## 具体实现

#### 源码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/mod.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/mod.ts)

#### 源码讲解

demo/web_router/mod.ts

```js
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
  constructor(method, path, middleware) {
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

  /**
   * 将路由规则转成正则配置
   * @param path {string}
   * @return {RegExp}
   */
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
  private register(method, path, middleware) {
    const layer = new RouteLayer(method, path, middleware);
    this._stack.push(layer);
  }

  /**
   * 注册 GET请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public get(path, middleware) {
    this.register("GET", path, middleware);
  }

  /**
   * 注册 POST请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public post(path, middleware) {
    this.register("POST", path, middleware);
  }

  /**
   * 注册 DELETE请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public delete(path, middleware) {
    this.register("DELETE", path, middleware);
  }

  /**
   * 注册 PUT请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public put(path, middleware) {
    this.register("PUT", path, middleware);
  }

  /**
   * 注册 PATCH请求路由
   * @param path {string} 路由规则
   * @param middleware {Function} 路由中间件方法
   */
  public patch(path, middleware) {
    this.register("PATCH", path, middleware);
  }

  /**
   * @return {Function} 返回路由顶级中间件
   */
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
          // 把路由解析数据存到上下文的数据缓存里
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
```

### 使用例子

#### 使用源码

demo/web_router/example.ts

```js
// 依赖 demo/web/mod.ts 中间件框架
import { Application } from "./../web/mod.ts";
import { Route, Router } from "./mod.ts";
const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

const router = new Router();

router.get("/index", async function(ctx) {
  ctx.res.setBody(`
  <ul>
    <li><a href="/hello">/hello</a></li>
    <li><a href="/foo">/foo</a></li>
    <li><a href="/bar">/bar</a></li>
    <li><a href="/page/p001/user/u002">/page/p001/user/u002</a></li>
    <li><a href="/page/p002/user/u_abcd">/page/p002/user/u_abcd</a></li>
  </ul>
  `);
  ctx.res.setHeader('content-type', 'text/html')
  ctx.res.setStatus(200);
});

router.get("/hello", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("this is hello page");
});
router.get("/foo", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("this is foo page");
});
router.get("/bar", async function(ctx) {
  ctx.res.setStatus(200);
  ctx.res.setBody("this is bar page");
});
router.get("/page/:pageId/user/:userId", async function(ctx) {
  const params = ctx.getData("router");
  ctx.res.setStatus(200);
  ctx.res.setBody(`${JSON.stringify(params)}`);
});

app.use(router.routes());

app.use(async function(ctx, next) {
  console.log('action before');
  ctx.res.setBody("hello web_router!");
  await next();
  console.log('action after');
});


app.listen(opts, function(){
  console.log(`listening on ${opts.hostname}:${opts.port}`);
});
```

#### 执行结果

```sh
deno run --allow-net example.ts
```

#### 结果显示

- 访问 [http://127.0.0.1:3001/index](http://127.0.0.1:3001/index)

![web_router_001](https://user-images.githubusercontent.com/8216630/53285609-768f3280-379d-11e9-9738-7cc08b5b5dca.jpg)


- 访问 [http://127.0.0.1:3001/page/p002/user/u_abcd](http://127.0.0.1:3001/page/p002/user/u_abcd)

![web_router_002](https://user-images.githubusercontent.com/8216630/53285611-768f3280-379d-11e9-9da7-af17cd90dfe1.jpg)


## 测试

### 单元测试

- 测试服务
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/test_server.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/test_server.ts)
- 单元测试核心
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/test.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_router/test.ts)



