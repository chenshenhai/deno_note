function createResponse (): Uint8Array {
  const bodyStr = "hello world";
  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const resHeaders = [
    `HTTP/1.1 200`,
    `content-length: ${bodyStr.length}`,
    CRLF
  ];
  const ctxHeader = encoder.encode(resHeaders.join(CRLF));
  const ctxBody = encoder.encode(bodyStr);
  const data = new Uint8Array(ctxHeader.byteLength + ctxBody.byteLength);
  data.set(ctxHeader, 0);
  data.set(ctxBody, ctxHeader.byteLength);
  return data;
}

function response(conn: Deno.Conn) {
  const ctx = createResponse();
  conn.write(ctx);
  conn.close();
}

async function server(addr: string) {
  const listener = Deno.listen("tcp", addr);
  console.log("listening on", addr);
  while (true) {
    const connection = await listener.accept();
    response(connection);
  }
}

const addr = "127.0.0.1:3001";
server(addr);