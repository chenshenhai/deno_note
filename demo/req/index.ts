import { args, listen, Conn } from "deno";

const addr = args[1] || "127.0.0.1:3001";
const CRLF = "\r\n";
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

function getHttpContext (bodyStr: string): Uint8Array {
  // const bodyStr = JSON.stringify({hello: "world"});
  const body = encoder.encode(bodyStr);
  const headers = [
    "HTTP/1.1 ",
    `Content-Length: ${body.length}`,
    `${CRLF}`
  ].join(CRLF);
  const ctx = encoder.encode(headers);
  const data = new Uint8Array(ctx.length + (body ? body.length : 0));
  data.set(ctx, 0);
  if (body) {
    data.set(body, ctx.length);
  }
  return data;
}

async function getReq(conn: Conn): Promise<string> {
  const buffer = new Uint8Array(4096);
  await conn.read(buffer);
  const headers = decoder.decode(buffer);
  const headersObj = {};
  const headerList = headers.split(CRLF);
  headerList.forEach(function(item, i) {
    if (i === 0) {
      // headersObj["method"] = item;
      if (typeof item === "string") {
        // example "GET /index/html?a=1 HTTP/1.1";
        const regMatch = /([A-Z]{1,}){1,}\s(.*)\s(.*)/;
        const strList : object = item.match(regMatch);
        const method : string = strList[1] || "";
        const href : string = strList[2] || "";
        const protocol : string = strList[3] || "";
        
        const pathname : string = href.split("?")[0] || "";
        const search : string = href.split("?")[1] || "";
        
        headersObj["method"] = method;
        headersObj["protocol"] = protocol;
        headersObj["href"] = href;
        headersObj["pathname"] = pathname;
        headersObj["search"] = search;
      }
    } else {
      if (typeof item === "string" && item.length > 0) {
        const itemList = item.split(":");
        const key = itemList[0];
        const val = itemList[1];
        let keyStr = null;
        let valStr = null;
        if (key && typeof key === "string") {
          keyStr = key.trim();
        }
        if ( val && typeof val === "string") {
          valStr = val.trim();
        }
        if (typeof keyStr === "string" && typeof valStr === "string") {
          headersObj[keyStr] = valStr;
        }
      }
    }
  });
  return JSON.stringify(headersObj);
}

async function loop(conn: Conn): Promise<void> {
  try {
    const headers: string = await getReq(conn);
    const bodyStr = `${headers}`;
    const ctx = getHttpContext(bodyStr);
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