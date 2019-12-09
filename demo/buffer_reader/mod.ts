// Based on https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts
// Copyright (c) 2018 Daniel Lenksjö. All rights reserved.
// 参考源码: https://github.com/lenkan/deno-http/blob/master/src/buffered-reader.ts


const decoder = new TextDecoder();

// 回车符
const CR = "\r".charCodeAt(0); 
// 换行符
const LF = "\n".charCodeAt(0);

const MAX_BUFFER_SIZE = 4096;
const MIN_BUFFER_SIZE = 4;
const DEFAULT_BUFFER_SIZE = 256

interface BufReader {
  // 读取一行
  readLine(): Promise<string>;
  // 读取自定义块
  readCustomChunk(size: number): Promise<Uint8Array>;
  // 是否读数据结束
  isFinished(): boolean;
}

export class BufferReader implements BufReader {

  private _reader: Deno.Reader;
  private _size = DEFAULT_BUFFER_SIZE;
  // 数据读取是否到结尾
  private _eof = false;
  // 缓冲区数据读取的当前的索引
  private _currentReadIndex = 0;
  // 用来读取的数据的缓冲区
  private _chunk: Uint8Array = new Uint8Array(0);

  constructor(reader: Deno.Reader, size?: number) {
    this._reader = reader;
    if (size <= MAX_BUFFER_SIZE && size >= MIN_BUFFER_SIZE) {
      this._size = size;
    }
    this._chunk = new Uint8Array(0);
  }

  /** 
   * 是否读取结束
   * @return {bollean}
   * */ 
  isFinished(): boolean {
    return this._eof && this._current.byteLength === 0;
  }

  /** 
   * 读取一行
   * @return {Promise<string>}
   * */
  async readLine (): Promise<string>  {
    const chunk = await this.readLineChunk();
    const line: string = decoder.decode(chunk);
    return line;
  }

  /** 
   * 读取一行的块
   * @return {Promise<Uint8Array>}
   * */
  async readLineChunk (): Promise<Uint8Array>  {
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
          return lineBuf;
        }
      }
      const result = await this._readChunk();
      if (!result) {
        break;
      }
    }

    const result = this._current;
    this._chunk = new Uint8Array(0);
    return result;
  }

  /** 
   * 读取一个自定义长度的数据块
   * @return {Promise<boolean>}
   * */
  async readCustomChunk(size: number): Promise<Uint8Array>{
    let customLength = size;
    if (size < 0) {
      customLength = 0;
    }
    const current = this._current;
    const currentLength = current.length;
    let customChunk = new Uint8Array(0);

    if ( customLength <= currentLength ) {
      customChunk = current.subarray(0, customLength);
      this._currentReadIndex = customLength;
    } else {
      const remianingLength = customLength - currentLength;
      const remainingChunk = new Uint8Array(remianingLength);
      await this._reader.read(remainingChunk);
      customChunk = new Uint8Array(customLength);
      customChunk.set(current, 0);
      customChunk.set(remainingChunk, current.length);
    }
    this._chunk = new Uint8Array(0);
    this._currentReadIndex = 0;
    return customChunk;
  }

  /** 
   * 是否为回车换行字符
   * @param {Uint8Array} buf
   * @return {bollean}
   * */ 
  private _isCRLF(buf): boolean {
    return buf.byteLength === 2 && buf[0] === CR && buf[1] === LF;
  }

  /** 
   * 读取缓冲区当前已经读到的数据块
   * @return {Uint8Array}
   * */
  private get _current() {
    return this._chunk.subarray(this._currentReadIndex);
  }

  /** 
   * 读取一个数据块
   * @return {Promise<boolean>}
   * */
  private async _readChunk(): Promise<boolean> {
    let isNeedRead = false;
    
    if (this._eof === true) {
      return isNeedRead;
    }
    const chunk = new Uint8Array(this._size);
    const result = await this._reader.read(chunk);
    const nread: number = result === Deno.EOF ? 0 : result;
    if (nread === 0) {
      this._eof = true;
      return isNeedRead;
    } else {
      isNeedRead = true;
    }

   
    let remainLength = 0;
    if (this._chunk.byteLength > 0 ) {
      remainLength = this._chunk.byteLength - this._currentReadIndex
    }

    const newChunk = new Uint8Array(remainLength + nread);
    newChunk.set(this._chunk.subarray(this._currentReadIndex), 0);
    newChunk.set(chunk.subarray(0, nread), remainLength);
    this._currentReadIndex = 0;
    this._chunk = newChunk;
    return isNeedRead;
  }

}
