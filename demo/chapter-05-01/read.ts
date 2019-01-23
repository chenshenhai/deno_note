import {readFileSync} from 'deno';

async function read(path: string): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  const bytes = readFileSync(path);
  const text = decoder.decode(bytes);
  return text;
}

async function main(): Promise<void> {
  const text = await read("./assets/index.txt");
  console.log(text);
}

main();