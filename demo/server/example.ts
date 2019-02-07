import { listen, Conn, } from "deno";

import { RequestReader } from "./../request/mod.ts";
import { ResponseWriter } from "./../response/mod.ts";

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

class ServerRequest {
  url: string;
  method: string;
  proto: string;
  headers: Headers;
  conn: Conn;

  async respond(r: Response): Promise<void> {
    const resWriter = new ResponseWriter(this.conn);
    resWriter.setBody('hello my server web');
    resWriter.setStatus(200);
    await resWriter.write();
  }
}



function serveConn(env: ServeEnv, conn: Conn) {
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
    reqQueue: [], 
    serveDeferred: deferred()
  };

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

  while (true) {
    await env.serveDeferred.promise;
    env.serveDeferred = deferred(); 
    let queueToProcess = env.reqQueue;
    env.reqQueue = [];
    for (const req of queueToProcess) {
      yield req;
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
  const req = new ServerRequest();
  req.conn = c;
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

