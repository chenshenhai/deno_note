// Based on https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// Copyright (c) 2018 Daniel Lenksjö. All rights reserved.
// 参考源码: https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts

import { Reader } from "deno";

const decoder = new TextDecoder();
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);

export interface BufReader {
  readLine(): Promise<string>;
  isFinished(): boolean;
}

export class BufferReader implements BufReader {
  private _reader: Reader;
  private _size = 1024;
  private _eof = false;
  private _index = 0;
  private _chunk: Uint8Array = new Uint8Array(0);

  constructor(reader: Reader, size?: number) {
    this._reader = reader;
    if (size > 0) {
      this._size = size;
    }
    this._chunk = new Uint8Array(this._size);
  }

  isFinished(): boolean {
    return this._eof;
  }

  async readLine (): Promise<string>  {
    let lineBuf = new Uint8Array(0);
    while(!this._eof || this._chunk.length > 0) {
      const current = this._current;
      for (let i = 0; i < current.byteLength; i++) {
        const buf = current.subarray(i, i + 2);
        if (this._isCRLF(buf) === true) {
          lineBuf = current.subarray(0, i);
          this._index += i + 2;
          return decoder.decode(lineBuf);
        }
      }
      const result = await this._readChunk();
      if (!result) {
        break;
      }
    }

    return decoder.decode(this._current);
  }

  private _isCRLF(buf): boolean {
    return buf.byteLength === 2 && buf[0] === CR && buf[1] === LF;
  }

  private get _current() {
    return this._chunk.subarray(this._index);
  }

  private async _readChunk(): Promise<boolean> {
    let isNeedRead = false;
    
    if (this._eof === true) {
      return isNeedRead;
    }
    const chunk = new Uint8Array(this._size);
    const result = await this._reader.read(chunk);
  
    console.log("result = ", result);

    if (result.eof === true || result.nread === 0) {
      this._eof = true;
      return isNeedRead;
    } else {
      isNeedRead = true;
    }

    const remainIndex = chunk.byteLength - this._index;
    
    const newChunk = new Uint8Array(remainIndex + result.nread);
    newChunk.set(this._chunk.subarray(this._index), 0);
    newChunk.set(chunk.subarray(0, result.nread), remainIndex);
    this._index = 0;
    this._chunk = newChunk;
    return isNeedRead;
  }

}
