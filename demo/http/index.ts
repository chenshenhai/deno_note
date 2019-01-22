import { listen, Conn } from "deno";

/**
 * 创建响应内容
 * @return {Uint8Array}
 */
function createResponse (): Uint8Array {
  const bodyStr = "<h1>hello world</h1>";
  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const resHeaders = [
    `HTTP/1.1 200`,
    `Content-Length: ${bodyStr.length}`,
    `${CRLF}`
  ];
  const resBody = [
    `${bodyStr}`,
  ]; 
  const res = [
    ...resHeaders,
    ...resBody,
  ].join(CRLF);
  const ctx = encoder.encode(res);
  return ctx;
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