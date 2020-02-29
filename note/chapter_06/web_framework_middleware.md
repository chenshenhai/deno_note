# 中间件式框架简单实现

## 前言

熟悉`Node.js` `WEB`开发的小伙伴肯定知道，在`Node.js`世界里，基本所有`WEB`开发的框架都是基于中间件形式架构。中间件架构大部分以`HTTP`的生命周期切面来提供中间件的处理，既能在任何开发语言低成本实现，又能符合开发者操作思维，方便生态的扩展。

综上所诉，实现一个`Deno`的`WEB`框架，中间件式的框架是比较低成本和大众高接受度，本篇将基于`Koa.js`的洋葱模型中间件机制，集合上一章节里的 [5.8 原生Deno处理HTTP请求](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/08.md)、 [5.9 原生Deno处理HTTP响应](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/09.md) 和 [5.10 原生Deno实现稳定HTTP服务](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/10.md) 打造一个健壮的 `Deno`版 `Koa.js`。

## 实现过程

- 提供一个可让中间件安全操作的`HTTP`上下文(`Context`)
  - `Request`安全操作，限制中间件只能去取请求行、请求头和请求体三种数据
  - `Response`安全操作
    - 限制中间件只能设置响应状态、响应头和响应体操作
    - 同时加上设置响应结束保护处理，防止响应设置提前结束，剩余中间件操作对响应数据的影响
  - 提供中间件数据通信方法
    - 数据通信的读、写、判断和清空处理
- 利用 [5.10 原生Deno实现稳定HTTP服务](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/10.md) 的服务，创建一个`HTTP`安全上下文`SafeContext`
- 将 `SafeContext` 传入洋葱模型的处理中间件机制`compose`中
- 中间件结束和异常处理

## 具体实现

### 中间件内安全操作Context

#### 源码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/web/context.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web/context.ts)

#### 源码讲解

demo/web/context.ts

```js
/** 
 * 
 * Request 取自于 [5.8 原生Deno处理HTTP请求](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/08.md)
 * Response 取自于 [5.9 原生Deno处理HTTP响应](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/09.md)
 * Context 取自于 [5.10 原生Deno实现稳定HTTP服务](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/10.md)
 * */
import { Context } from "./../server/context.ts";
import { Request } from "./../request/mod.ts";
import { Response } from "./../response/mod.ts";

/**
 * 封装安全的HTTP请求操作类
 * 只开放 getGeneral()、getHeaders()和getBodyStream 这三个方法
 */
class SafeRequest {
  private _req: Request;
  constructor(req: Request) {
    this._req = req;
  }

  async getGeneral(): Promise<object> {
    return await this._req.getGeneral();
  }

  async getHeaders(): Promise<Headers> {
    return await this._req.getHeaders();
  }

  async getBodyStream(): Promise<Uint8Array> {
    return await this._req.getBodyStream();
  }
}

/**
 * 封装安全的HTTP响应操作类
 * 重新封装 4个原有Response的方法
 * 保证响应结束后，禁止进行响应数据的设置，或者写操作
 *  setHeader(key: string, val: string): boolean;
 *  getHeaders(): Headers;
 *  setStatus(code: number): boolean;
 *  getStatus(): number;
 *  setBody(body: string): boolean;
 *  getBody(): string;
 * 添加判断是否响应结束的方法
 *  isFinish(): boolean
 * 添加设置响应结束的方法
 *  setFinish(): void
 */
class SafeResponse {
  private _res: Response;
  private _isFinish: boolean = false;
  constructor(res: Response) {
    this._res = res;
  }

  setHeader(key: string, val: string): boolean {
    if (this.isFinish() === true) {
      // 响应结束了，不再进行设置操作
      return false;
    }
    return this._res.setHeader(key, val);
  }
  getHeaders(): Headers {
    return this._res.getHeaders();
  }
  setStatus(status: number) {
    if (this.isFinish() === true) {
      // 响应结束了，不再进行设置操作
      return false;
    }
    return this._res.setStatus(status);
  }
  getStatus(): number {
    return this._res.getStatus();
  }
  setBody(body: string) {
    if (this.isFinish() === true) {
      // 响应结束了，不再进行设置操作
      return false;
    }
    return this._res.setBody(body);
  }
  getBody(): string {
    return this._res.getBody();
  }

  async flush(): Promise<number> {
    if (this.isFinish() === true) {
      // 响应结束了，不再进行TCP对象写操作
      return -1;
    }
    return await this._res.flush();
  }

  isFinish() {
    return this._isFinish;
  }
  setFinish() {
    this._isFinish = true;
  }
}


/**
 * 封装安全的HTTP上下文操作类
 * 基于 原有的 Context
 *  加工原有的 Context.req 成为可安全请求操作对象 SafeRequest
 *  加工原有的 Context.res 成为可安全响应操作对象 SafeResponse
 * 添加上下文缓存数据的能力，保证在中间件里可以进行数据通信
 * setData(key: string, val: any)
 * getData(key: string): string
 * cleanData()
 * hasData(key: string): boolean
 * deleteData(key: string)
 */
class SafeContext {
  private _ctx: Context;
  private _dataMap: object = {};
  public req: SafeRequest;
  public res: SafeResponse;
  constructor(ctx: Context) {
    this._ctx = ctx;
    this.req = new SafeRequest(ctx.req);
    this.res = new SafeResponse(ctx.res);
  }

  public setData(key: string, val: any) {
    if (!this._dataMap) {
      this._dataMap = {};
    }
    this._dataMap[key] = val;
  }

  public getData(key: string): string {
    const dataMap = this._dataMap || {};
    const val = dataMap[key];
    return val;
  }

  public cleanData() {
    this._dataMap = {};
  }

  public hasData(key: string): boolean {
    const dataMap = this._dataMap || {};
    return dataMap.hasOwnProperty(key);
  }

  public deleteData(key: string) {
    if (this._dataMap) {
      delete this._dataMap[key];
    }
  }
}

export { Context, SafeContext }
```

### 利用Koa.js洋葱模型

#### 源码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/web/compose.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web/compose.ts)

#### 洋葱模型讲解

本篇是实现一个`Deno`
版的`Koa.js`，因此就需要知道`Koa.js`框架洋葱模型的中间件机制原理。`Koa.js`的洋葱模型是基于`koa-compose`的`npm`模块来实现的。我之前已在 [Koa.js 设计模式-学习笔记-中间件引擎](https://github.com/chenshenhai/koajs-design-note/blob/master/note/chapter01/05.md) 详细讲解了，如果需要了解，可点击进入观看。

### 封装框架

#### 源码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/web/application.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web/application.ts)

#### 源码讲解

`./demo/web/application.ts`

```js
import { Context, SafeContext } from "./context.ts";
import { Server } from "./../server/mod.ts";
import { compose } from "./compose.ts";

const exit = Deno.exit;

class Application {

  private _middlewares: Function[];
  private _server: Server;

  constructor() {
    this._middlewares = [];
    // 内置一个服务对象
    this._server = new Server();
  }

  /**
   * 注册使用中间件
   * @param fn {Function}
   */
  public use(fn: Function): void {
    this._middlewares.push(fn);
  }

  /**
   * 开始监听服务
   * @param opts {Deno.ListenOptions} 监听地址和端口 
   * @param fn {Function} 监听执行后的回调
   */
  public async listen(opts: Deno.ListenOptions, fn: Function) {
    const that = this;
    const server = this._server;
    // 启动HTTP服务
    server.createServer(async function(ctx: Context) {
      const middlewares = that._middlewares;
      
      try {
        // 将HTTP服务生成的 HTTP上下文封装成一个安全操作的上下文
        // 安全HTTP上下文限制了所有中间件能操作的范围
        const sctx = new SafeContext(ctx);
        
        // 等待执行所有中间件
        await compose(middlewares)(sctx);
        const body = sctx.res.getBody();

        // 如果最后响应报文没有响应体，就默认设置404文案
        if (!(body && typeof body === "string" && body.length > 0)) {
          sctx.res.setBody("404 Not Found!");
        }
        // 最后写入响应数据
        await ctx.res.flush();
      } catch (err) {
        that._onError(err, ctx);
      }
    }); 
    server.listen(opts, fn);
  }

  /**
   * 统一错误处理
   * @param err {Error} 错误对象
   * @param ctx {SafeContext} 当前HTTP上下文
   */
  private async _onError(err: Error, ctx: Context) {
    console.log(err);
    if (ctx instanceof Context) {
      // 出现错误，把错误堆栈打印到页面上
      ctx.res.setBody(err.stack || 'Server Error');
      ctx.res.setStatus(500);
      await ctx.res.flush();
    } else {
      exit(1);
    }
  }
}

export { Application };
```

### 使用例子

`./demo/web/example.ts`

```ts
import { Application } from "./mod.ts";

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

app.use(async function(ctx, next) {
  console.log('action 001');
  ctx.res.setBody("hello world! middleware-001");
  await next();
  console.log('action 006');
});

app.use(async function(ctx, next) {
  console.log('action 002');
  ctx.res.setBody("hello world! middleware-002");
  ctx.res.setStatus(200);
  // 提前设置结束
  // 页面将会渲染 "hello world! middleware-002"
  // 不会渲染 第三个中间件设置的响应体内容
  ctx.res.setFinish();
  await next();
  // throw new Error('hello this is testing error')
  console.log('action 005');
});

app.use(async function(ctx, next) {
  console.log('action 003');
  ctx.res.setBody("hello world! middleware-003");
  await next();
  console.log('action 004');
});

app.listen(opts, function() {
  console.log("the web is starting")
});
```

#### 执行结果

```sh
deno run --allow-net example.ts
```

#### 结果显示

- 例子代码里，第二个中间件提前设置结束 `ctx.res.setFinish()`
- 页面将会渲染 "hello world! middleware-002"
- 不会渲染 第三个中间件设置的响应体内容

![web_example_001](https://user-images.githubusercontent.com/8216630/52956163-8091e980-33c9-11e9-9b53-8b923bc15b72.jpg)

![web_exmaple_002](https://user-images.githubusercontent.com/8216630/52956168-838cda00-33c9-11e9-9522-c31fd5a651e1.jpg)

### 使用例子异常情况

#### 异常例子源码

```ts
import { Application } from "./mod.ts";

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

app.use(async function(ctx, next) {
  console.log('action 001');
  ctx.res.setBody("hello world! middleware-001");
  await next();
  console.log('action 006');
});

app.use(async function(ctx, next) {
  console.log('action 002');
  ctx.res.setBody("hello world! middleware-002");
  await next();
  // 抛出异常
  throw new Error('hello this is testing error')
  console.log('action 005');
});

app.use(async function(ctx, next) {
  console.log('action 003');
  ctx.res.setBody("hello world! middleware-003");
  await next();
  console.log('action 004');
});

app.listen(opts, function() {
  console.log("the web is starting")
});
```
#### 异常处理结果显示

![web_example_003](https://user-images.githubusercontent.com/8216630/52956936-7f61bc00-33cb-11e9-9d56-f649091a7c8f.jpg)

![web_example_004](https://user-images.githubusercontent.com/8216630/52956938-7ffa5280-33cb-11e9-9c38-50cd0da200f5.jpg)



## 测试

### 基准测试

- 安装测试工具 `npm i -g autocannon`

#### 发起100请求测试 
- `autocannon http://127.0.0.1:3001/ -c 100`
- 就会出现以下结果
![web_test_001](https://user-images.githubusercontent.com/8216630/52956493-470dae00-33ca-11e9-96ff-f4f9dfda6aac.jpg)


### 单元测试

- 测试服务
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/web/test_server.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web/test_server.ts)
- 单元测试核心
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/web/test.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web/test.ts)
  

