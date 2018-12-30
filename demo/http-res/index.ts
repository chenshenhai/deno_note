
import { args, listen, Conn } from "deno";

const addr = args[1] || "127.0.0.1:3001";
const CRLF = "\r\n";
const encoder = new TextEncoder();

interface Response {
  headers: string[];
  body: string;
}

function setRes (res: Response): Uint8Array {
  const {headers, body} = res;
  const ctx = encoder.encode(headers.join(CRLF));
  const ctxBody = encoder.encode(body);
  const data = new Uint8Array(ctx.length + (ctxBody ? ctxBody.length : 0));
  data.set(ctx, 0);
  if (ctxBody) {
    data.set(ctxBody, ctx.length);
  }
  return data;
}

async function loop(conn: Conn): Promise<void> {
  const body = "{\"a\":1}";
  try {
    const ctx = setRes({
      headers: [
        "HTTP/1.1 ",
        `Content-Length: ${body.length}`,
        `${CRLF}`
      ],
      body,
    });
    await conn.write(ctx);
    conn.close();
  } catch(err) {
    console.log(err);
    conn.close();
  }
}

async function server(addr: string): Promise<void> {
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  while (true) {
    const connection = await listener.accept();
    loop(connection);
  }
}

server(addr);