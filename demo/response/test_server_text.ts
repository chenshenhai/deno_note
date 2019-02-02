import { listen, Conn } from "deno";
import { Response, ResponseWriter } from "./mod.ts";

const decoder = new TextDecoder();


async function server(addr: string) {
  const listener = listen("tcp", addr);
  console.log(`listening on ${addr} \r\n`,);
  while (true) {
    const conn = await listener.accept();
    const res: Response = new ResponseWriter(conn);
    res.setBody("hello world");
    res.setStatus(200);
    res.end();
  }
}

const addr = "127.0.0.1:3001";
server(addr);