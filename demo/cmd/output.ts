async function sleep(time: number = 100): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}

let beforeLength: number = 0;

function output(text: string) {
  const encode = new TextEncoder();
  const chunk = encode.encode(`\x1b[${beforeLength}D \x1b[K ${text}`);
  Deno.stdout.writeSync(chunk);
  beforeLength = chunk.length;
}

function nextLine() {
  Deno.stdout.writeSync(new TextEncoder().encode(`\x1b[0C \x1b[K\r\n`));
}

async function main() {
  for (let i = 0; i < 100; i ++) {
    await sleep(10);
    const text = `${i}%`;
    output(text);
  }
  nextLine();
}

main();