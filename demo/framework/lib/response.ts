import { Conn } from "deno";

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const CRLF = "\r\n";
const defaultBody = "404 Not Found!";

export interface Res {
  getEndStatus: Function;
  setHeader: Function;
  getHeader: Function;
  setBody: Function;
  getBody: Function;
  end: Function;
}

export class Response implements Res {
  private conn: Conn;
  private headers: {};
  private body : string;
  private isEnd: boolean;

  constructor(conn: Conn) {
    this.conn = conn;
    this.isEnd = false;
  }

  public getEndStatus(): boolean {
    const isEnd = this.isEnd;
    return isEnd;
  }

  public setHeader(data: object): void {
    this.headers = {...{}, ...this.headers, ...data};
  }

  public getHeader(): {} {
    const headers = this.headers || {};
    return headers;
  }

  public setBody(body: string) {
    this.body = body || defaultBody;
  }

  public getBody(): string {
    const body = this.body || defaultBody;
    return body;
  }
  
  public end(): void {
    const conn = this.conn;
    if (this.isEnd !== true) {
      if (conn && conn.close && typeof conn.close === "function") {
        const result = this.getResult();
        this.isEnd = true;
        console.log("result.... = ", decoder.decode(result));
        this.conn.write(result);
        this.conn.close();
      }
    }
  }

  private getResult (): Uint8Array {
    const body = this.getBody();
    const headers = this.getHeaderLines();
    let resHeaders = [];
    if ( Array.isArray(headers) === true && headers.length > 0) {
      resHeaders = [...resHeaders, ...headers];
    }
    const ctx = encoder.encode(resHeaders.join(CRLF));
    const ctxBody = encoder.encode(body);
    const data = new Uint8Array(ctx.byteLength + (ctxBody ? ctxBody.byteLength : 0));
    data.set(ctx, 0);
    if (ctxBody) {
      data.set(ctxBody, ctx.byteLength);
    }
    return data;
  }

  private getHeaderLines(): string[] {
    const lines = [];
    const body = this.getBody();
    const headers = this.getHeader();
    const protocol = headers["headers"] || "HTTP/1.1 ";
    const contentLength = headers["Content-Length"] || `Content-Length: ${body.length}`;
    lines.push(protocol);
    lines.push(contentLength);

    const keywords = ["protocol", "content-length"];
    for (const key in headers) {
      const val = headers[key];
      if (key && typeof key === "string" && val && typeof val === "string") {
        if (keywords.indexOf(key.toLocaleLowerCase()) > -1) {
          lines.push(`${key}: ${val}`);
        }
      }
    }
    lines.push(`${CRLF}`);
    return lines;
  }
  
}
