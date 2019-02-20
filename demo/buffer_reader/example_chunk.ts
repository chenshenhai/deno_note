const decoder = new TextDecoder();
const encoder = new TextEncoder();

const str = `hello\r\nworld\r\n!\r\n`;
const stream = encoder.encode(str);
const reader = new Deno.Buffer(stream);
const chunk: Uint8Array = new Uint8Array(8);

async function main() {
  const result = await reader.read(chunk);
  console.log(result) // export:  { nread: 8, eof: false }
  console.log(decoder.decode(chunk)); // export: hello\r\nw
}

main();