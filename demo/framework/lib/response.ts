import { Conn } from "deno";

const encoder = new TextEncoder();
const CRLF = "\r\n";

interface Res {
  headers: string[];
  body: string;
  end: Function;
}

class Response {
  private conn: Conn;
  private headers: {};
  private body : string;

  constructor(conn: Conn) {
    this.conn = conn;
  }

  public setHeader(data: object): void {
    this.headers = {...{}, ...this.headers, data};
  }

  public getHeader(): {} {
    const headers = this.headers;
    return headers;
  }

  public setBody(body: string) {
    this.body = body;
  }

  public getBody(): string {
    const body = this.body;
    return body;
  }
  
  public end(): void {
    const conn = this.conn;
    if (conn && conn.close && typeof conn.close === "function") {
      this.conn.close();
    }
  }

  private getResult (): Uint8Array {
    const body = this.getBody();
    const headers = this.getHeaderLines();
    let resHeaders = [
      "HTTP/1.1 ",
      `Content-Length: ${body.length}`,
      `${CRLF}`
    ];
    if (headers && headers.length > 0) {
      resHeaders = headers;
    }
    const ctx = encoder.encode(resHeaders.join(CRLF));
    const ctxBody = encoder.encode(body);
    const data = new Uint8Array(ctx.length + (ctxBody ? ctxBody.length : 0));
    data.set(ctx, 0);
    if (ctxBody) {
      data.set(ctxBody, ctx.length);
    }
    return data;
  }

  private getHeaderLines(): string[] {
    let lines = [];
    const headers = this.headers;
    
  }
  
}

export default Response;
