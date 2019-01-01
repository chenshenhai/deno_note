import { Conn } from "deno";

const encoder = new TextEncoder();
const CRLF = "\r\n";

class Response {
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
    this.body = body || "";
  }

  public getBody(): string {
    const body = this.body;
    return body;
  }
  
  public end(): void {
    const conn = this.conn;
    if (conn && conn.close && typeof conn.close === "function") {
      const result = this.getResult();
      this.isEnd = true;
      this.conn.write(result);
      this.conn.close();
    }
  }

  private getResult (): Uint8Array {
    let body = this.getBody();
    if (!(typeof body === "string" && body.length > 0)) {
      body = "404 Not Found!";
    }
    const headers = this.getHeaderLines();
    let resHeaders = this.getHeaderLines();
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

export default Response;
