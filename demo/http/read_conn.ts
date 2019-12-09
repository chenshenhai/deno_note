import { BufferReader } from "./../buffer_reader/mod.ts";


export interface ReadRequest {
  headers: { [key: string]: string };
  general: { [key: string]: string };
  bodyStream: Uint8Array
}

export async function readConn(conn: Deno.Conn): Promise<ReadRequest> {
  const bufReader = new BufferReader(conn);
  const headers = {};
  let bodyStream = new Uint8Array(0);

  // 读取 HTTP 头部 第一行
  const firstLine = await bufReader.readLine();
  const regMatch = /([A-Z]{1,}){1,}\s(.*)\s(.*)/;
  const strList : object = firstLine.match(regMatch) || [];
  const method : string = strList[1] || "";
  const href : string = strList[2] || "";
  const protocol : string = strList[3] || "";
  const pathname : string = href.split("?")[0] || "";
  const search : string = href.split("?")[1] || "";

  // 读取 HTTP 头部信息 直至空行位置
  let isHeadersFinished: boolean = false;
  while(!isHeadersFinished) {
    const line: string = await bufReader.readLine();
    // 如果为空字符串，那就是headers和body的分界
    if (!line) {
      isHeadersFinished = true;
      break;
    }
    const dataList = line.split(': ');
    headers[dataList[0]] = dataList[1] || '';
  }

  // 读取 HTTP 报文内容
  const contentLength = parseInt(headers["Content-Length"] || "0", 10);
  bodyStream = new TextEncoder().encode("");
  if (contentLength > 0) {
    bodyStream = await bufReader.readCustomChunk(contentLength);
  }

  return {
    headers,
    general: {
      method,
      protocol,
      pathname,
      search
    },
    bodyStream: bodyStream
  }
}