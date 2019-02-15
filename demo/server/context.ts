import { Conn } from "deno";
import { Request, RequestReader } from "./../request/mod.ts";
import { Response, ResponseWriter } from "./../response/mod.ts";

/**
 * @class Conn对话上下文
 *  内置 HTTP请求操作
 *  内置 HTTP响应操作
 */
class Context {
  public req: Request;
  public res: Response; 

  public conn: Conn;

  constructor(conn: Conn) {
    this.conn = conn;
    this.req = new RequestReader(conn);
    this.res = new ResponseWriter(conn);
  }

  /**
   * Conn对话结束操作
   */
  close() {
    this.conn.close();
  }
}

export { Context };