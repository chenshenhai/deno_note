import {writeFileSync} from 'deno';

const encoder = new TextEncoder();

async function main(): Promise<void> {
  const data = encoder.encode("this is writing result!");
  await writeFileSync("./assets/result.txt", data);
}

main();