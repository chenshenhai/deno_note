// Based on https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// Based on https://github.com/denoland/deno_std/blob/master/textproto/mod.ts
// license that can be found in the LICENSE file.

// 参考源码: https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// 参考源码: https://github.com/denoland/deno_std/blob/master/textproto/mod.ts

import { Conn } from "deno";
import { BufReader, BufferReader } from "./../buffer_reader/mod.ts";

export interface ReqGeneral {
  method: string;
  pathname: string;
  protocol: string;
  search: string;
}

export interface Request {
  getHeaders(): Promise<Headers>;
  getGeneral(): Promise<ReqGeneral>;
  getBodyStream(): Promise<Uint8Array>;
  isFinish(): boolean;
}

export class RequestReader implements Request {
  private _bufferReader: BufReader;
  private _size = 1024;
  
  private _headers: Headers;
  private _method: string | null;
  private _protocol: string | null;
  private _pathname: string | null;
  private _search: string | null;

  private _bodyStream: Uint8Array | null;

  constructor(conn: Conn, size?: number) {
    if (size > 0) {
      this._size = size;
    }
    this._bufferReader = new BufferReader(conn, this._size);
    this._method = null;
    this._protocol = null;
    this._pathname = null;
    this._search = null;

    this._headers = null;
    this._bodyStream = null;
  }

  async getGeneral(): Promise<ReqGeneral> {
    await this._initHeaderFristLineInfo();
    return {
      method: this._method,
      protocol: this._protocol,
      pathname: this._pathname,
      search: this._search,
    };
  }

  async getHeaders(): Promise<Headers> {
    if (this._headers) {
      return this._headers;
    }
    const headers = new Headers();
    let isHeadersFinished = false;
    await this._initHeaderFristLineInfo();
    while(!isHeadersFinished) {
      const line: string = await this._readLine();
      // 如果为空字符串，那就是headers和body的分界
      if (!line) {
        isHeadersFinished = true;
        break;
      }
      let index = line.indexOf(":");
      if (index < 0) {
        continue;
      }
      let endKey = index;
      while (endKey > 0 && line[endKey - 1] === " ") {
        endKey--;
      }

      //let key = canonicalMIMEHeaderKey(kv.subarray(0, endKey));
      const key = line.substring(0, endKey);

      // As per RFC 7230 field-name is a token, tokens consist of one or more chars.
      // We could return a ProtocolError here, but better to be liberal in what we
      // accept, so if we get an empty key, skip it.
      if (key === "") {
        continue;
      }

      // Skip initial spaces in value.
      index++; // skip colon
      while (
        index < line.length &&
        (line[index] === " " || line[index] === "\t")
      ) {
        index ++;
      }
      const value = line.substring(index);
      headers.append(key, value);
    }
    this._headers = headers;
    return headers;
  }

  isFinish(): boolean {
    return this._bodyStream !== null;
  }

  async getBodyStream() {
    if (this._bodyStream) {
      return this._bodyStream;
    }
    const headers = await this.getHeaders();
    const contentLength = parseInt(headers.get("content-length") || "0", 10);
    const bodyStream = await this._bufferReader.readCustomChunk(contentLength);
    this._bodyStream = bodyStream;
    return bodyStream;
  }

  private async _initHeaderFristLineInfo() {
    if (this._method !== null || this._pathname !== null || this._protocol !== null) {
      return;
    }
    // example "GET /index/html?a=1 HTTP/1.1";
    const firstLine = await this._readLine();
    const regMatch = /([A-Z]{1,}){1,}\s(.*)\s(.*)/;
    const strList : object = firstLine.match(regMatch) || [];
    const method : string = strList[1] || "";
    const href : string = strList[2] || "";
    const protocol : string = strList[3] || "";
    const pathname : string = href.split("?")[0] || "";
    const search : string = href.split("?")[1] || "";

    this._method = method;
    this._protocol = protocol;
    this._pathname = pathname;
    this._search = search;
  }

  private async _readLine (): Promise<string>  {
    return await this._bufferReader.readLine();
  }
  
}
