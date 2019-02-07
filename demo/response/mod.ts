import { Conn } from "deno";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const CRLF = "\r\n";

export interface Response {
  setHeaders(key: string, val: string): boolean;
  setStatus(code: number): boolean;
  setBody(body: string): boolean;
  getBody(): string;
  end();
}

export class ResponseWriter implements Response {
  private _conn: Conn;
  private _status: number = 404;
  private _body: string = "";
  private _headers: Headers = new Headers();

  constructor(conn: Conn) {
    this._conn = conn;
  }

  setHeaders(key: string, val: string): boolean {
    try {
      if (this._headers.has(key)) {
        this._headers.set(key, val);
      } else {
        this._headers.append(key, val);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  setBody(body: string) {
    try {
      this._body = body;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getBody(): string {
    return this._body;
  }

  setStatus(status: number) {
    try {
      this._status = status;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async write() {
    const resStream = this.createReqStream();
    const conn = this._conn;
    await conn.write(resStream);
  }

  end() {
    const resStream = this.createReqStream();
    const conn = this._conn;
    conn.write(resStream);
    conn.close();
  }

  private createReqStream() {
    const headers = this._headers;
    const body = this._body;
    const bodyStream = encoder.encode(body);
    headers.set("content-length", `${bodyStream.byteLength}`);
    const resLines = [];
    const status = this._status;
    resLines.push(`HTTP/1.1 ${status} OK`);
    for ( const key of headers.keys() ) {
      const val = headers.get(key) || "";
      resLines.push(`${key}:${val}`);
    }
    resLines.push(CRLF);
    const headerStr = resLines.join(CRLF);
    const headerChunk = encoder.encode(headerStr);
    const bodyChunk = encoder.encode(body);
    const res = new Uint8Array(headerChunk.byteLength + bodyChunk.byteLength);
    res.set(headerChunk, 0);
    res.set(bodyChunk, headerChunk.byteLength);
    return res;
  }

}