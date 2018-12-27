/**
 *  Thanks to https://github.com/lenkan/deno-http/
 *  Copy from  https://github.com/lenkan/deno-http/
 */

import { Reader as DenoReader, Closer as DenoCloser } from "deno";

export interface Reader {
  finished(): boolean;
  read(length: number): Promise<Uint8Array>;
  readLine(): Promise<string>;
}

function isLineFeed(a: Uint8Array) {
  return a.byteLength === 2 && a[0] === 13 && a[1] === 10;
}

const decoder = new TextDecoder();

export class BufferedReader implements Reader {
  private data: Uint8Array = new Uint8Array(0);
  private pos: number = 0;
  private eof: boolean = false;

  constructor(
    public reader: DenoReader & DenoCloser, 
    private size: number
  ) { }

  private async take(size: number) {
    if (this.eof) {
      return false;
    }

    const chunk = new Uint8Array(size);
    const result = await this.reader.read(chunk);
    if (result.eof) {
      this.eof = result.eof;
      this.reader.close();
    }
    const remaining = this.data.byteLength - this.pos;
    const newData = new Uint8Array(remaining + result.nread);
    newData.set(this.data.subarray(this.pos), 0);
    newData.set(chunk.subarray(0, result.nread), remaining);
    this.data = newData;
    this.pos = 0;
    return result.nread > 0;
  }

  private get current() {
    return this.data.subarray(this.pos);
  }

  finished(): boolean {
    return this.eof && this.current.byteLength === 0;
  }

  close() {
    if (!this.eof) {
      this.reader.close();
    }
  }

  async readLine(): Promise<string> {
    while (!this.eof || this.current.byteLength > 0) {
      const current = this.current;
      for (let i = 0; i < this.current.byteLength; ++i) {
        if (isLineFeed(current.subarray(i, i + 2))) {
          const result = current.subarray(0, i);
          this.pos += i + 2;
          return decoder.decode(result);
        }
      }

      if (!(await this.take(this.size))) {
        break;
      }
    }

    // No CRLF encountered, but stream has ended, so return what we've got
    return decoder.decode(this.current);
  }

  async read(length: number): Promise<Uint8Array> {
    const current = this.current;
    if (current.byteLength < length) {
      await this.take(Math.max(length - current.byteLength, this.size));
    }

    const end = Math.min(this.current.byteLength, length);
    const result = this.current.subarray(0, end);
    this.pos += end;
    return result;
  }

  static from(reader: DenoReader & DenoCloser, size: number) {
    return new BufferedReader(reader, size);
  }
}
