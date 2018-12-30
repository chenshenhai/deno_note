import { listen, Conn } from "deno";
import { getRequest } from "./req";
import { createResponse } from "./res";

// const encoder = new TextEncoder();
export class Server {
  // private middlewares: Function[];

  // private pushMiddleware(fn: Function): void{
  //   this.middlewares.push(fn);
  // }

  // public use(fn) {
  //   this.middlewares.push(fn);
  // }

  public async loop(conn: Conn): Promise<void> {
    try {
      const req : {} = await getRequest(conn);
      const ctx = await createResponse({
        headers: [],
        body: JSON.stringify(req)
      });
      await conn.write(ctx);
      conn.close();
    } catch(err) {
      console.log(err);
      conn.close();
    }
  }

  public async listen(addr: string) {
    const listener = listen("tcp", addr);
    console.log("listening on", addr);
    while (true) {
      const connection = await listener.accept();
      this.loop(connection);
    }
  }
}
