import { Context } from "./context.ts";

const listen = Deno.listen;

/**
 * 等待延迟接口
 */
interface Deferred {
  promise: Promise<{}>;
  resolve: () => void;
  reject: () => void;
}

/**
 * 初始化一个等待延时操作
 * @return {Deferred}
 */
function deferred(): Deferred {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}

/**
 * HTTP上下文环境
 */
interface ContextEnv {
  queue: Context[];
  deferred: Deferred;
}

/**
 * 处理HTTP上下文服务
 * @param {ContextEnv} env 上下文环境
 * @param {Conn} conn TCP对话
 * @param {Context} ctx 一次TCP对话连接封装的HTTP上下文
 */
function serveContext(env: ContextEnv, conn: Deno.Conn, ctx?: Context) {
  loopContext(conn).then(function([ctx, err]){
    if (err) {
      // 处理TCP对话如果有错误，就结束对话
      // 一个HTTP 响应结束
      conn.close();
      return;
    } else {
      // 如果处理TCP对话没问题
      // 就把TCP对话重新加入队列，重新下一次等待
      env.queue.push(ctx);
      env.deferred.resolve();
    }
  })
}

/**
 * TCP 主服务方法
 * @param addr 
 */
async function* serve(opts: Deno.ListenOptions) {
  // 监听 TCP 端口
  const listener = listen(opts);
  // 初始化一个HTTP上下文环境
  const env: ContextEnv = {
    queue: [], 
    deferred: deferred()
  };

  // 等待接收TCP对话 方法
  const acceptRoutine = () => {
    // 操作TCP对话方法
    const handleConn = (conn: Deno.Conn) => {
      // 处理HTTP上下文服务
      serveContext(env, conn);
      // 安排TCP对话，加入TCP对话等待排队处理
      scheduleAccept(); 
    };
    // TCP对话等待排队处理
    const scheduleAccept = () => {
      listener.accept().then(handleConn);
    };
    scheduleAccept();
  };

  // 等待接收TCP对话 
  acceptRoutine();

  while (true) {
    // 等待上一个HTTP上下文队列 全部清空执行完
    await env.deferred.promise;
    // 重新初始化一个等待延迟处理
    env.deferred = deferred(); 
    let queueToProcess = env.queue;
    env.queue = [];
    for (const ctx of queueToProcess) {
      yield ctx;
      // 处理下一个 HTTP上下文服务
      serveContext(env, ctx.conn, ctx);
    }
  }
  listener.close();
}

/**
 * 创建 HTTP服务
 * @param {string} addr 
 * @param {function} handler 
 */
async function createHTTP(
  opts: Deno.ListenOptions,
  handler: (ctx) => void
) {
  const server = serve(opts);
  for await (const ctx of server) {
    // 处理每一个服务的操作
    await handler(ctx);
  }
}


/**
 * 循环HTTP上下文的读取操作
 * 等待取出问题，就是代表一个TCP对话已经结束
 * @param {Conn} c
 */
async function loopContext(c: Deno.Conn): Promise<[Context, any]> {
  const ctx = new Context(c);
  let err: any;

  try {
    await ctx.req.getGeneral();
  } catch (e) {
    err = e;
  }

  if (err) {
    return [null, err];
  }
  
  try {
    await ctx.req.getHeaders();
  } catch (e) {
    err = e;
  }

  try {
    await ctx.req.getBodyStream();
  } catch (e) {
    err = e;
  }

  return [ctx, err];
}


export class Server {
  private _handler: (ctx: Context) => Promise<void>;
  private _isInitialized: boolean = false; // 是否已经初始化
  private _isListening: boolean = false; // 是否已经在监听中

  createServer(handler) {
    if (this._isInitialized !== true) {
      this._handler = handler;
      this._isInitialized = true;
      return this;
    } else {
      throw new Error('The http service has been initialized');
    }
  }

  listen(opts: Deno.ListenOptions, callback) {
    if (this._isListening !== true) {
      const handler = this._handler;
      createHTTP(opts, handler);
      callback();
      this._isInitialized = true;
    } else {
      throw new Error('The http service is already listening');
    }
  }
}

