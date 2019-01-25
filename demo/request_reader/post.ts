import { listen, Conn } from "deno";

function createResponse (): Uint8Array {
  const bodyStr = "hello world";
  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const ctxBody = encoder.encode(bodyStr);
  const resHeaders = [
    `HTTP/1.1 200`,
    `content-length: ${ctxBody.byteLength}`,
    CRLF
  ];
  const ctxHeader = encoder.encode(resHeaders.join(CRLF));
  const data = new Uint8Array(ctxHeader.byteLength + ctxBody.byteLength);
  data.set(ctxHeader, 0);
  data.set(ctxBody, ctxHeader.byteLength);
  return data;
}

function response(conn: Conn) {
  const ctx = createResponse();
  conn.write(ctx);
  conn.close();
}

async function server(addr: string) {
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  while (true) {
    const connection = await listener.accept();
    response(connection);
  }
}

const addr = "127.0.0.1:3001";
server(addr);