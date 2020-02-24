// deno --allow-write make.ts

const { mkdirSync } = Deno;
async function main(): Promise<void> {
  mkdirSync("./assets/new_dir");
}

main();