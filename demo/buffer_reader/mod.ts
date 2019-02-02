// Based on https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// Copyright (c) 2018 Daniel Lenksjö. All rights reserved.
// 参考源码: https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts

import { Reader } from "deno";

const decoder = new TextDecoder();
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);

const MAX_BUFFER_SIZE = 4096;
const MIN_BUFFER_SIZE = 4;
const DEFAULT_BUFFER_SIZE = 256

export interface BufReader {
  readLine(): Promise<string>;
  isFinished(): boolean;
}

export class BufferReader implements BufReader {

  private _reader: Reader;
  private _size = DEFAULT_BUFFER_SIZE;
  private _eof = false;
  private _currentReadIndex = 0;
  private _chunk: Uint8Array = new Uint8Array(0);

  constructor(reader: Reader, size?: number) {
    this._reader = reader;
    if (size <= MAX_BUFFER_SIZE && size >= MIN_BUFFER_SIZE) {
      this._size = size;
    }
    this._chunk = new Uint8Array(0);
  }

  isFinished(): boolean {
    return this._eof && this._current.byteLength === 0;
  }

  async readLine (): Promise<string>  {
    let lineBuf = new Uint8Array(0);
    while(!this._eof || this._chunk.length > 0) {
      const current = this._current;
      for (let i = 0; i < current.byteLength; i++) {
        if (current.byteLength <= 0) {
          continue;
        }
        const buf = current.subarray(i, i + 2);
        if (this._isCRLF(buf) === true) {
          lineBuf = current.subarray(0, i);
          this._currentReadIndex += i + 2;
          return decoder.decode(lineBuf);
        }
      }
      const result = await this._readChunk();
      if (!result) {
        break;
      }
    }

    const result = this._current;
    this._chunk = new Uint8Array(0);
    return decoder.decode(result);
  }

  private _isCRLF(buf): boolean {
    return buf.byteLength === 2 && buf[0] === CR && buf[1] === LF;
  }

  private get _current() {
    return this._chunk.subarray(this._currentReadIndex);
  }

  private async _readChunk(): Promise<boolean> {
    let isNeedRead = false;
    
    if (this._eof === true) {
      return isNeedRead;
    }
    const chunk = new Uint8Array(this._size);
    const result = await this._reader.read(chunk);

    if (result.eof === true || result.nread === 0) {
      this._eof = true;
      return isNeedRead;
    } else {
      isNeedRead = true;
    }

   
    let remainLength = 0;
    if (this._chunk.byteLength > 0 ) {
      remainLength = this._chunk.byteLength - this._currentReadIndex
    }

    const newChunk = new Uint8Array(remainLength + result.nread);
    newChunk.set(this._chunk.subarray(this._currentReadIndex), 0);
    newChunk.set(chunk.subarray(0, result.nread), remainLength);
    this._currentReadIndex = 0;
    this._chunk = newChunk;
    return isNeedRead;
  }

}
