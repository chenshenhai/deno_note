import { Context } from "./../server/context.ts";
import { Request, ReqGeneral } from "./../request/mod.ts";
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

  async getGeneral(): Promise<ReqGeneral> {
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
  private _dataMap: {[key: string]: any} = {};
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