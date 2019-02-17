import {writeFileSync} from 'deno';

const encoder = new TextEncoder();

function main(): void {
  const data = encoder.encode("this is writing result!");
  writeFileSync("./assets/result.txt", data);
}

main();