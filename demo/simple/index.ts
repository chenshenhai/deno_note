import { serve } from "./lib/http";

const host = "127.0.0.1:8000";
const s = serve(host);

async function main() {
  for await (const req of s) {
    req.respond({ body: new TextEncoder().encode("Hello World\n") });
  }
}

main();
console.log(`the server is starting at ${host}`);