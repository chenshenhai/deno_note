
const process = Deno.run({
  cmd: [Deno.execPath(), "run", "--allow-net", "./server.ts"]
});

setTimeout(() => {
  process.close();
}, 1000 * 60)