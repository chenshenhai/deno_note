
import { args, listen, Conn } from "deno";

const addr = args[1] || "127.0.0.1:3001";
const CRLF = "\r\n";
const encoder = new TextEncoder();

function getHttpContext (): Uint8Array {
  // const bodyStr = JSON.stringify({hello: "world"});
  const bodyStr = "<h1>hello world</h1>";
  const body = encoder.encode(bodyStr);
  const headers = [
    "HTTP/1.1 ",
    `Content-Length: ${body.length}`,
    `${CRLF}`
  ].join(CRLF);
  const ctx = encoder.encode(headers);
  const data = new Uint8Array(ctx.length + (body ? body.length : 0));
  data.set(ctx, 0);
  if (body) {
    data.set(body, ctx.length);
  }
  return data;
}

async function server(addr: string) {
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  const ctx = getHttpContext();
  async function loop(conn: Conn) {
    await conn.write(ctx);
    conn.close();
  }
  while (true) {
    const connection = await listener.accept();
    loop(connection);
  }
}

server(addr);