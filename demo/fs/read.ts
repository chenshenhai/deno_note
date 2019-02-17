import {readFileSync} from 'deno';

async function main(): Promise<void> {
  const decoder = new TextDecoder("utf-8");
  const bytes = readFileSync("./assets/index.txt");
  const text = decoder.decode(bytes);
  console.log(text);
}

main();