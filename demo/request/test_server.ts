import { Request, RequestReader } from "./mod.ts";
const listen = Deno.listen;

const decoder = new TextDecoder();

function createResponse (bodyStr: string): Uint8Array {
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

async function response(conn: Deno.Conn) {
  const req: Request = new RequestReader(conn);
  const beforeFinish = req.isFinish();
  const headers: Headers = await req.getHeaders();
  const headerObj = {};
  for(const key of headers.keys()) {
    headerObj[key] = headers.get(key); 
  }
  const generalObj = await req.getGeneral();
  const bodyStream = await req.getBodyStream();
  const afterFinish = req.isFinish();
  const body: string = decoder.decode(bodyStream);
  const ctx = createResponse(JSON.stringify({
    general: generalObj,
    headers: headerObj,
    body,
    beforeFinish,
    afterFinish
  }));
  await conn.write(ctx);
  conn.close();
}

async function server(opts: Deno.ListenOptions) {
  console.log("listening on", `${opts.hostname}:${opts.port}\r\n`);
  const listener = listen(opts);
  while (true) {
    const conn = await listener.accept();
    await response(conn);
  }
}

server({
  hostname: "0.0.0.0",
  port: 3001
});