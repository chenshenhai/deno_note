import { Conn } from "deno";
import { Request, RequestReader } from "./../request/mod.ts";
import { Response, ResponseWriter } from "./../response/mod.ts";

export class Context {
  public req: Request;
  public res: Response;

  constructor(conn: Conn) {
    this.req = new RequestReader(conn);
    this.res = new ResponseWriter(conn);
  }
}