const listen = Deno.listen;

/**
 * HTTP响应操作
 * @param conn {Conn}
 */
async function response(conn: Deno.Conn) {
  const encoder = new TextEncoder();
  // 准备响应体数据流
  const bodyStr = "hello world";
  const body = encoder.encode(bodyStr);

  // TCP对话连接 写入响应行
  //    协议: HTTP/1.1
  //    状态码: 200
  //    状态结果: OK
  await conn.write(encoder.encode('HTTP/1.1 200 OK\r\n'));
  // TCP对话连接 写入响应头
  //   响应内容长度: content-length (如果是非按数据块返回的，就必须声明内容长度)
  //   其他响应头信息
  await conn.write(encoder.encode(`content-length: ${body.byteLength}\r\n`));
  await conn.write(encoder.encode(`content-xxxxxxx: abcdefg12345\r\n`));
  // TCP对话连接 写入空行，区分响应头和响应体
  await conn.write(encoder.encode('\r\n'));
  // TCP对话连接 写入响应体
  await conn.write(body);
  conn.close();
}

/**
 * HTTP服务
 * @param addr {string}
 */
async function server(opts: Deno.ListenOptions) {
  // 创建TCP服务
  const listener: Deno.Listener = Deno.listen(opts) as Deno.Listener;
  console.log(`listening on ${opts.hostname}:${opts.port}`);
  // 死循环监听TCP请求
  while (true) {
    // 等待TCP连接
    const connection = await listener.accept();
    // 执行响应
    response(connection);
  }
}

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}
server(opts);