import { Response, ResponseWriter } from "./mod.ts";

const listen = Deno.listen

async function server(opts: Deno.ListenOptions) {
  const listener: Deno.Listener = Deno.listen(opts) as Deno.Listener;
  console.log(`listening on ${opts.hostname}:${opts.port}`);
  while (true) {
    const conn = await listener.accept();
    const response: Response = new ResponseWriter(conn);
    response.setBody("hello world");
    response.setStatus(200);
    const num = await response.flush();
    conn.close();
  }
}

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}
server(opts);