import { ReadResult, Conn } from "deno";
import { test, assert, equal } from "https://deno.land/x/testing/mod.ts";

class ConnExample implements Conn {
  private _buffer: Uint8Array;
  private _eof : boolean = false;
  constructor(buffer) {
    this._buffer = buffer;
  }
  read(array: Uint8Array): Promise<ReadResult> {
    if (this._eof === true) {
      return Promise.resolve<ReadResult>({
        nread: 0,
        eof: true
      });
    }
    const nread = Math.min(this._buffer.byteLength, array.byteLength);
    array.set(this._buffer.slice(0, nread));
    this._buffer = this._buffer.slice(nread);
    this._eof = this._buffer.byteLength === 0;
    return Promise.resolve<ReadResult>({
      nread,
      eof: this._eof
    });
  }
}

test(async function testRequest() {
  assert(equal(1, 1));
});