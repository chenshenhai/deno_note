
import { args, listen, Conn } from "deno";
import { getRequest } from "./lib/req";
import { createResponse } from "./lib/res";

const addr = args[1] || "127.0.0.1:3001";

function middleware(req, res) {
  return async function(req, res) {

  };
}

async function loop(conn: Conn): Promise<void> {
  try {
    const req = await getRequest(conn);
    const res = await createResponse({
      headers: [],
      body: JSON.stringify(req)
    });
    await conn.write(res);
    conn.close();
  } catch(err) {
    console.log(err);
    conn.close();
  }
}

async function server(addr: string): Promise<void> {
  const listener = listen("tcp", addr);
  console.log("listening on", addr);
  while (true) {
    const connection = await listener.accept();
    loop(connection);
  }
}

server(addr);