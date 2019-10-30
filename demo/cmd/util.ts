

export async function sleep(time: number = 10): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}

export function printNewLine() {
  Deno.stdout.writeSync(new TextEncoder().encode(`\x1b[0C \x1b[K\r\n`));
}

export function clearLine(len: number)  {
  Deno.stdout.writeSync(new TextEncoder().encode(`\x1b[${len}D`));
}