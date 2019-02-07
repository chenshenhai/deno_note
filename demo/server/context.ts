import { Conn } from "deno";
import { Request, RequestReader } from "./../request/mod.ts";
import { Response, ResponseWriter } from "./../response/mod.ts";


class Context {
  public req: Request;
  public res: Response; 

  public conn: Conn;

  constructor(conn: Conn) {
    this.conn = conn;
    this.req = new RequestReader(conn);
    this.res = new ResponseWriter(conn);
  }

  close() {
    this.conn.close();
  }
}

export { Context };