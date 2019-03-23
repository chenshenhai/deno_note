
const process = Deno.run({
  args: ["deno", "--allow-net", "./server.ts"]
});

setTimeout(() => {
  process.close();
}, 1000 * 60)