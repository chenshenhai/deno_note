import { listen, Conn } from "deno";
import { Response, ResponseWriter } from "./mod.ts";

async function server(addr: string) {
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  while (true) {
    const conn = await listener.accept();
    const response: Response = new ResponseWriter(conn);
    response.setBody("hello world");
    response.setStatus(200);
    const num = await response.flush();
    conn.close();
  }
}

const addr = "127.0.0.1:3001";
server(addr);