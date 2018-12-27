/**
 *  Thanks to https://github.com/lenkan/deno-http/
 *  Copy from  https://github.com/lenkan/deno-http/
 */

import { listen } from "./lib/http";

listen("127.0.0.1:3000", async (req, res) => {
  const encoder = new TextEncoder("utf8");

  const body = encoder.encode(JSON.stringify({
    hello: "world"
  }));

  await res
    .status(200, "OK")
    .headers({
      "Content-Type": "application/json",
      "Content-Length": body.byteLength.toString()
    }).send(body);
});