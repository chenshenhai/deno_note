import { Reader, Buffer } from "deno";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

// 回车符
const CR = "\r".charCodeAt(0); 
// 换行符
const LF = "\n".charCodeAt(0);

const str = `hello\r\nworld\r\n!\r\n`;
const stream = encoder.encode(str);
const reader = new Buffer(stream);
const chunk: Uint8Array = new Uint8Array(8);


const eof = false;
const currentReadIndex = 0;


async function main() {
  const result = await reader.read(chunk);
  console.log(result) // export:  { nread: 8, eof: false }
  console.log(decoder.decode(chunk)); // export: hello\r\nw
}

main();