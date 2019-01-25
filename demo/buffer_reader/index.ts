import { Buffer } from "deno";
import { BufReader, BufferReader } from "./buffer_reader.ts";

const encoder = new TextEncoder();
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