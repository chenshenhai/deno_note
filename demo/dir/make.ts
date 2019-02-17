import {mkdirSync, } from 'deno';

async function main(): Promise<void> {
  mkdirSync("./assets/new_dir");
}

main();