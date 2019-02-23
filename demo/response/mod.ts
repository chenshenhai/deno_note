import { Conn } from "deno";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const CRLF = "\r\n";

// 响应码对应信息
const statusMap = {
  "200": "OK",
  "404": "Not Found",
  "500": "Server Error",
  "unknown": "Unknown Error"
  // TODO ....
  // 其他状态码信息
}

export interface Response {
  setHeader(key: string, val: string): boolean;
  getHeaders(): Headers;
  setStatus(code: number): boolean;
  getStatus(): number;
  setBody(body: string): boolean;
  getBody(): string;
  flush(): Promise<number>;
}

export class ResponseWriter implements Response {
  private _conn: Conn;
  private _status: number = 404;
  private _body: string = "";
  private _headers: Headers = new Headers();

  constructor(conn: Conn) {
    this._conn = conn;
  }

  /**
   * 设置响应头信息
   * @param {string} key 响应头信息 key
   * @param {string} val 响应头信息 值
   * @return {boolean} 是否设置成功
   * */
  setHeader(key: string, val: string): boolean {
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

  /**
   * 获取所有响应头信息
   * @return {Headers}
   * */
  getHeaders() {
    return this._headers;
  }

  /**
   * 设置响应体信息
   * @param {string} body 响应体信息
   * @return {boolean} 是否设置成功
   * */
  setBody(body: string) {
    try {
      this._body = body;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * 获取所有响应状态码
   * @return {number}
   * */
  getStatus() {
    return this._status;
  } 

  /**
   * 获取请求体
   * @return {string}
   * */
  getBody(): string {
    return this._body;
  }

  /**
   * 设置状态码
   * @param {number} status
   * @return {boolean} 是否设置成功
   * */
  setStatus(status: number) {
    try {
      this._status = status;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * 响应信息写入对话
   * @return {number} 对话写入的长度
   * */
  async flush() {
    const resStream = this.createReqStream();
    const conn = this._conn;
    // TODO: 需要优化循环判断返回长度是否等于写入的数据
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
    // TODO: HTTP目前写死 1.1版本
    resLines.push(`HTTP/1.1 ${status} ${statusMap[`${status || 'unknown'}`]}`);
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