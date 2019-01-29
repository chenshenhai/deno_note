import { listen, Conn } from "deno";

/**
 * 创建响应内容
 * @return {Uint8Array}
 */
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

/**
 * HTTP响应操作
 * @param conn {Conn}
 */
async function response(conn: Conn) {
  // 创建响应信息
  const ctx = createResponse();
  // TCP连接写入响应信息
  await conn.write(ctx);
  conn.close();
}

/**
 * HTTP服务
 * @param addr {String}
 */
async function server(addr: string) {
  // 创建TCP服务
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  // 死循环监听TCP请求
  while (true) {
    // 等待TCP连接
    const connection = await listener.accept();
    // 执行响应
    response(connection);
  }
}

const addr = "127.0.0.1:3001";
server(addr);