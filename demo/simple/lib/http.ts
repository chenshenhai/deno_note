/**
 *  Thanks to https://github.com/lenkan/deno-http/
 *  Copy from  https://github.com/lenkan/deno-http/
 */

import { listen as tcp, Conn } from "deno";
import { HttpRequest, read } from "./http-request";
import { HttpResponse, response } from "./http-response";

export type HttpHandler = (req: HttpRequest, res: HttpResponse) => void;

export async function listen(addr: string, handler: HttpHandler) {
  const listener = tcp("tcp", addr);

  async function loop(connection: Conn) {
    for await (const request of read(connection)) {
      handler(request, response(connection, request.headers));
    }
  }

  while (true) {
    const connection = await listener.accept();
    loop(connection);
  }
}
