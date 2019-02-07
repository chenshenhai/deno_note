import { listen, Conn, } from "deno";

import { BufWriter } from "https://raw.githubusercontent.com/denoland/deno_std/v0.2.8/io/bufio.ts";
import { RequestReader } from "./../request/mod.ts";

interface Deferred {
  promise: Promise<{}>;
  resolve: () => void;
  reject: () => void;
}

function deferred(): Deferred {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject
  };
}

interface ServeEnv {
  reqQueue: ServerRequest[];
  serveDeferred: Deferred;
}


interface Response {
  headers: Headers;
  body: Uint8Array;
  status: number;
}

// class SReq {
//   constructor()
// }

class ServerRequest {
  url: string;
  method: string;
  proto: string;
  headers: Headers;
  conn: Conn;
  w: BufWriter;

  async respond(r: Response): Promise<void> {
    const protoMajor = 1;
    const protoMinor = 1;
    const statusCode = r.status || 200;
    const statusText = "OK";
    if (!statusText) {
      throw Error("bad status code");
    }

    let out = `HTTP/${protoMajor}.${protoMinor} ${statusCode} ${statusText}\r\n`;


    if (r.headers) {
      for (const [key, value] of r.headers) {
        out += `${key}: ${value}\r\n`;
      }
    }
    out += "\r\n";

    const header = new TextEncoder().encode(out);
    let n = await this.w.write(header);

    if (r.body) {
      if (r.body instanceof Uint8Array) {
        n = await this.w.write(r.body);
      }
    }

    await this.w.flush();
  }
}


function serveConn(env: ServeEnv, conn: Conn) {

  // const request = new ResponseReader(conn);
  // request.getHeaders().then(function(headers) {
  //   if (headers instanceof Headers) {
  //     conn.close();
  //   } else {
  //     env.reqQueue.push(request);
  //     env.serveDeferred.resolve();
  //   }
  // })

  readRequest(conn).then(function([req, err]){
    if (err) {
      conn.close();
      return;
    } else {
      env.reqQueue.push(req);
      env.serveDeferred.resolve();
    }
  })

}

export async function* serve(addr: string) {
  const listener = listen("tcp", addr);
  const env: ServeEnv = {
    reqQueue: [], // in case multiple promises are ready
    serveDeferred: deferred()
  };

  // Routine that keeps calling accept
  const acceptRoutine = () => {
    const handleConn = (conn: Conn) => {
      serveConn(env, conn); // don't block
      scheduleAccept(); // schedule next accept
    };
    const scheduleAccept = () => {
      listener.accept().then(handleConn);
    };
    scheduleAccept();
  };

  acceptRoutine();

  // Loop hack to allow yield (yield won't work in callbacks)
  while (true) {
    await env.serveDeferred.promise;
    env.serveDeferred = deferred(); // use a new deferred
    let queueToProcess = env.reqQueue;
    env.reqQueue = [];
    for (const req of queueToProcess) {
      yield req;
      // Continue read more from conn when user is done with the current req
      // Moving this here makes it easier to manage
      serveConn(env, req.conn);
    }
  }
  listener.close();
}

export async function listenAndServe(
  addr: string,
  handler: (req) => void
) {
  const server = serve(addr);

  for await (const request of server) {
    await handler(request);
  }
}


async function readRequest(
  c: Conn,
): Promise<[ServerRequest, any]> {
  const bufw = new BufWriter(c);
  const req = new ServerRequest();
  req.conn = c;
  req.w = bufw;
  const reqReader = new RequestReader(c);

  let err: any;

  try {
    const gen = await reqReader.getGeneral();
    req.method = gen.method;
    req.url = gen.pathname;
    req.proto = gen.protocol;
  } catch (e) {
    err = e;
  }

  if (err) {
    return [null, err];
  }
  
  try {
    req.headers = await reqReader.getHeaders();
  } catch (e) {
    err = e;
  }

  return [req, err];
}


const addr = "127.0.0.1:3001"
listenAndServe(addr, async req => {
  const bodyBuf = new TextEncoder().encode("hello deno_note 001 web.ts");
  const headers = new Headers();
  headers.set("content-length", `${bodyBuf.byteLength}`);
  const rs = {
    status: 200,
    headers: headers,
    body: bodyBuf,
  }
  await req.respond(rs);
});

