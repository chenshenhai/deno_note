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