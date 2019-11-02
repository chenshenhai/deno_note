import { Response, ResponseWriter } from "./mod.ts";

const listen = Deno.listen;

async function server(opts: Deno.ListenOptions) {
  const listener = listen(opts);
  console.log(`listening on ${opts.hostname}:${opts.port}\r\n`,);
  while (true) {
    const conn = await listener.accept();
    const res: Response = new ResponseWriter(conn);
    res.setBody("hello world");
    res.setStatus(200);
    await res.flush();
    conn.close();
  }
}

server({
  hostname: "127.0.0.1",
  port: 3001
});
