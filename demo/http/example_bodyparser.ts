import { readConn, ReadRequest } from "./read_conn.ts";
import { bodyParser, parseContentType } from "./bodyparser.ts";

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
    `Content-Length: ${bodyStr.length}`,
    `Content-Type: text/html`,
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

  const req: ReadRequest = await readConn(conn);
  let body: string = ``;
  if (req.general["method"] === 'POST') {
    const formType = parseContentType(req.headers["Content-Type"]);
    const formData = await bodyParser(formType.boundary, req.bodyStream);
    // body = JSON.stringify(formData);
    body = `
    <textarea style="width:600px; height: 240px;">${JSON.stringify(formData)}</textarea>
    <textarea style="width:600px; height: 240px;">${formData.body}</textarea>
    `;
  } else {
    body = `
    <form method="POST" action="/" enctype="multipart/form-data">
      <p>data_name</p>
      <input name="data_id" value="012345" /><br/>
      <p>data_id</p>
      <input name="data_name" value="helloworld" /><br/>
      <p>data_image</p>
      <input name="image" type="file"  /><br/>
      <button type="submit">submit</button>
    </form>`;
  }

  const res = createResponse(body);
  // TCP连接写入响应信息
  await conn.write(res);
  conn.close();
}

/**
 * HTTP服务
 * @param opts {Deno.ListenOptions}
 */
async function server(opts: Deno.ListenOptions) {
  // 创建TCP服务
  const listener = Deno.listen(opts);
  console.log("listening on", `${opts.hostname}:${opts.port}`);
  // 死循环监听TCP请求
  while (true) {
    // 等待TCP连接
    const connection = await listener.accept();
    // 执行响应
    response(connection);
  }
}

server({
  hostname: "127.0.0.1",
  port: 3001
});