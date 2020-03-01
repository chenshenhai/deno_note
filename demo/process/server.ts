/**
 * 创建响应内容
 * @param {string} bodyStr
 * @return {Uint8Array}
 */
function createResponse (bodyStr: string): Uint8Array {
  const CRLF = "\r\n";
  const encoder = new TextEncoder();
  const resLines = [
    `HTTP/1.1 200`,
    `content-length: ${bodyStr.length}`,
    '',
    bodyStr
  ];
  const res = encoder.encode(resLines.join(CRLF));
  return res;
}

/**
 * HTTP响应操作
 * @param conn {Conn}
 */
async function response(conn: Deno.Conn) {
  // 创建响应信息
  const res = createResponse("hello world");
  // TCP连接写入响应信息
  await conn.write(res);
  conn.close();
}

/**
 * HTTP服务
 * @param addr {string}
 */
async function server(opts: Deno.ListenOptions) {
  // 创建TCP服务
  const listener: Deno.Listener = Deno.listen(opts) as Deno.Listener;
  console.log("listening on", opts);
  // 死循环监听TCP请求
  while (true) {
    // 等待TCP连接
    const connection = await listener.accept();
    // 执行响应
    response(connection);
  }
}

server({ port: 3001, hostname: "127.0.0.1"  });