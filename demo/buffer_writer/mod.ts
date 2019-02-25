const MAX_BUFFER_SIZE = 4096;
const MIN_BUFFER_SIZE = 4;
const DEFAULT_BUFFER_SIZE = 256

interface BufWriter {
  write(): Promise<number>;
  flush(): Promise<void>;
}

export class BufferWriter implements BufWriter {

  private _writer: Deno.Writer;
  private _size: number = DEFAULT_BUFFER_SIZE;
  private _chunk: Uint8Array;
  private _currentIndex: number = 0;

  constructor(writer: Deno.Writer, size?: number) {
    this._writer = writer;
    if (size <= MAX_BUFFER_SIZE && size >= MIN_BUFFER_SIZE) {
      this._size = size;
    }
    this._chunk = new Uint8Array(0);
  }

  async write(data: Uint8Array): Promise<number> {
    // TODO
    return -1;
  }

  async flush(): Promise<void> {
    // TODO
  }
}