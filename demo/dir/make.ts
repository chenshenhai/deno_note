import {mkdirSync, } from 'deno';

async function make(path: string): Promise<void> {
  const result = mkdirSync(path);
}

async function main(): Promise<void> {
  await make("./assets/new_dir");
}

main();