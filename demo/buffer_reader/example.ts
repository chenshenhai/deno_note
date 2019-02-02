import { Buffer } from "deno";
import { BufReader, BufferReader } from "./mod.ts";

const encoder = new TextEncoder();
async function main() {
  const str = `hello\r\nworld\r\n!\r\n`;
  const stream = encoder.encode(str);
  const buf = new Buffer(stream);
  const bufReader : BufReader = new BufferReader(buf);
  while(!bufReader.isFinished()) {
    console.log(await bufReader.readLine());
  }
}

main();