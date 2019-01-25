// Based on https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// Copyright (c) 2018 Daniel Lenksjö. All rights reserved.
// 参考源码: https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts

import { Buffer, Reader } from "deno";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface BufReader {
  readLine(): Promise<string>;
}

class BufferReader implements BufReader {
  private _reader: Reader;
  private _size = 1024;
  private _eof = false;
  private _index = 0;
  private _chunk: Uint8Array = new Uint8Array(0);

  private _CR = "\r".charCodeAt(0);
  private _LF = "\n".charCodeAt(0);

  constructor(reader: Reader, size?: number) {
    this._reader = reader;
    if (size > 0) {
      this._size = size;
    }
    this._chunk = new Uint8Array(this._size);
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
    return buf.byteLength === 2 && buf[0] === this._CR && buf[1] === this._LF;
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
    if (result.eof === true || result.nread === 0) {
      this._eof = true;
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

async function main() {
  const str = `hello\r\nworld\r\n!\r\n\r\n`;
  const stream = encoder.encode(str);
  const buf = new Buffer(stream);
  const bufReader : BufReader = new BufferReader(buf);
  console.log(await bufReader.readLine());
  console.log(await bufReader.readLine());
  console.log(await bufReader.readLine());
}

main();