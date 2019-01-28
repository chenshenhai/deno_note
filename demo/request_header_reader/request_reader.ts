// Based on https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// Based on https://github.com/denoland/deno_std/blob/master/textproto/mod.ts
// license that can be found in the LICENSE file.

// 参考源码: https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// 参考源码: https://github.com/denoland/deno_std/blob/master/textproto/mod.ts

import { Conn } from "deno";

const decoder = new TextDecoder();
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
const COLON = ":".charCodeAt(0);

export interface ConnReader {
  getHeaders(): Promise<Headers>;
}

export class RequestReader implements ConnReader {
  private _conn: Conn;
  private _size = 1024;
  private _eof = false;
  private _index = 0;
  private _chunk: Uint8Array = new Uint8Array(0);
  
  private _headers: Headers;
  private _method: string | null;
  private _protocol: string | null;
  private _pathname: string | null;
  private _search: string | null;

  constructor(conn: Conn, size?: number) {
    this._conn = conn;
    if (size > 0) {
      this._size = size;
    }
    this._chunk = new Uint8Array(this._size);
    this._method = null;
    this._protocol = null;
    this._pathname = null;
    this._search = null;
  }

  async getGeneral() {
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

  private isFinished(): boolean {
    return this._eof;
  }

  private async _readLine (): Promise<string>  {
    const lineChunk = await this._readLineChunk();
    const line = decoder.decode(lineChunk);
    return line;
  }
  private async _readLineChunk (): Promise<Uint8Array>  {
    let lineBuf = new Uint8Array(0);
    while(!this._eof || this._chunk.length > 0) {
      const current = this._current;
      for (let i = 0; i < current.byteLength; i++) {
        const buf = current.subarray(i, i + 2);
        if (this._isCRLF(buf) === true) {
          lineBuf = current.subarray(0, i);
          this._index += i + 2;
          return lineBuf;
        }
      }
      const result = await this._readChunk();
      if (!result) {
        break;
      }
    }

    return this._current;
  }

  private _isCRLF(buf): boolean {
    return buf.byteLength === 2 && buf[0] === CR && buf[1] === LF;
  }

  private get _current() {
    return this._chunk.subarray(this._index);
  }

  private async _readChunk(): Promise<boolean> {
    if (this._eof) {
      return false;
    }
    const chunk = new Uint8Array(this._size);
    const result = await this._conn.read(chunk);
    
    if (result.eof === true) {
      this._eof = true;
    }

    const remainIndex = chunk.byteLength - this._index;
    
    const newChunk = new Uint8Array(remainIndex + result.nread);
    newChunk.set(this._chunk.subarray(this._index), 0);
    newChunk.set(chunk.subarray(0, result.nread), remainIndex);
    this._index = 0;
    this._chunk = newChunk;

    return result.nread > 0;
  }

}
