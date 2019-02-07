import { Conn } from "deno";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const CRLF = "\r\n";

export interface Response {
  setHeaders(key: string, val: string): boolean;
  getHeaders(): Headers;
  setStatus(code: number): boolean;
  getStatus(): number;
  setBody(body: string): boolean;
  getBody(): string;
  write(): Promise<number>;
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

  getHeaders() {
    return this._headers;
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

  getStatus() {
    return this._status;
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
    const n = await conn.write(resStream);
    return n;
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