
import { args, listen, copy, Conn } from "deno";

const addr = args[1] || "127.0.0.1:3001";
const CRLF = "\r\n";
const encoder = new TextEncoder();
const body = encoder.encode(JSON.stringify({
  hello: "world"
}));

const lines = [
  "HTTP/1.1 ",
  `Content-Length: ${body.length}`,
  `${CRLF}`
].join(CRLF);
const envelope = encoder.encode(lines);
const data = new Uint8Array(envelope.length + (body ? body.length : 0));
data.set(envelope, 0);
if (body) {
  data.set(body, envelope.length);
}

const server = async function(addr: string) {
  const listener = listen("tcp", addr);
  async function loop(conn: Conn) {
    await conn.write(data);
    conn.close();
  }
  while (true) {
    const connection = await listener.accept();
    loop(connection);
  }
};

server(addr);