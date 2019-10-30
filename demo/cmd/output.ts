import { sleep, printNewLine } from "./util.ts";

let beforeLength: number = 0;

function output(text: string) {
  const encode = new TextEncoder();
  const chunk = encode.encode(`\x1b[${beforeLength}D \x1b[K ${text}`);
  Deno.stdout.writeSync(chunk);
  beforeLength = chunk.length;
}

async function main() {
  for (let i = 0; i < 100; i ++) {
    await sleep(10);
    const text = `${i}%`;
    output(text);
  }
  printNewLine();
}

main();