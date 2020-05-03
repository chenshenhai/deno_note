// deno --allow-read read.ts

const rs = Deno.readDirSync("./assets/");
for (const item of rs) {
  console.log(item);
}