import { Response, ResponseWriter } from "./mod.ts";

const listen = Deno.listen;

async function server(addr: string) {
  const listener = listen("tcp", addr);
  console.log(`listening on ${addr}\r\n`,);
  while (true) {
    const conn = await listener.accept();
    const res: Response = new ResponseWriter(conn);
    const data = {
      "data": "helloworld"
    }
    res.setBody(JSON.stringify(data));
    res.setStatus(200);
    await res.flush();
    conn.close();
  }
}

const addr = "127.0.0.1:3001";
server(addr);