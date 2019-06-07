import { BufferReader } from "./mod.ts";

const encoder = new TextEncoder();
async function main() {
  const str = `hello\r\nworld\r\n!\r\n`;
  const stream = encoder.encode(str);
  const buf = new Deno.Buffer(stream);
  const bufReader : BufferReader = new BufferReader(buf);
  while(!bufReader.isFinished()) {
    const line = await bufReader.readLine();
    console.log("======= line ====== ", line);
  }
}

main();