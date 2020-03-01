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

async function response(conn: Deno.Conn) {
  const ctx = createResponse();
  await conn.write(ctx);
  conn.close();
}

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

async function server(opts: Deno.ListenOptions) {
  const listener: Deno.Listener = Deno.listen(opts) as Deno.Listener;
  console.log("listening on", `${opts.hostname}:${opts.port}`);
  while (true) {
    const connection = await listener.accept();
    response(connection);
  }
}

server(opts);