import { Context } from "./../server/context.ts";
import { Request } from "./../request/mod.ts";
import { Response } from "./../response/mod.ts";

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


class SafeResponse {
  private _res: Response;
  private _isFinish: boolean = false;
  constructor(res: Response) {
    this._res = res;
  }

  setHeaders(key: string, val: string): boolean {
    if (this.isFinish() === true) {
      return false;
    }
    return this._res.setHeaders(key, val);
  }
  getHeaders(): Headers {
    return this._res.getHeaders();
  }
  setStatus(status: number) {
    if (this.isFinish() === true) {
      return false;
    }
    return this._res.setStatus(status);
  }
  getStatus(): number {
    return this._res.getStatus();
  }
  setBody(body: string) {
    if (this.isFinish() === true) {
      return false;
    }
    return this._res.setBody(body);
  }
  getBody(): string {
    return this._res.getBody();
  }
  async flush(): Promise<number> {
    if (this.isFinish() === true) {
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

class SafeContext {
  private _ctx: Context;
  public req: SafeRequest;
  public res: SafeResponse;
  constructor(ctx: Context) {
    this._ctx = ctx;
    this.req = new SafeRequest(ctx.req);
    this.res = new SafeResponse(ctx.res);
  }
}

export { Context, SafeContext }