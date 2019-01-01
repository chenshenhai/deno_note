import { Conn } from "deno";

const decoder = new TextDecoder();
const CRLF = "\r\n";

class Request {
  private conn: Conn;
  private reqData: {};
  
  constructor(conn: Conn) {
    this.conn = conn;
    this.reqData = this.getReqData();
  }

  public getMethod() {
    const reqData = this.reqData;
    return reqData["method"];
  }

  public getProtocol() {
    const reqData = this.reqData;
    return reqData["protocal"];
  }

  public getHeader() {
    const reqData = this.reqData;
    const headers = Object.assign({}, reqData);
    return headers;
  }

  public getCookie() {
    const reqData = this.reqData;
    return reqData["cookie"];
  }

  public getQuery() {
    const reqData = this.reqData;
    return reqData["search"];
  }

  private async getReqData(): Promise<object> {
    const conn = this.conn;
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
    return headersObj;
  }
}

export default Request;