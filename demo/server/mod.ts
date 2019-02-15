import { listen, Conn, } from "deno";

import { Context } from "./context.ts";

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

interface ContextEnv {
  queue: Context[];
  deferred: Deferred;
}

function serveContext(env: ContextEnv, conn: Conn, ctx?: Context) {
  loopContext(conn).then(function([ctx, err]){
    if (err) {
      conn.close();
      return;
    } else {
      env.queue.push(ctx);
      env.deferred.resolve();
    }
  })
}

async function* serve(addr: string) {
  const listener = listen("tcp", addr);
  const env: ContextEnv = {
    queue: [], 
    deferred: deferred()
  };

  const acceptRoutine = () => {
    const handleConn = (conn: Conn) => {
      serveContext(env, conn); // don't block
      scheduleAccept(); // schedule next accept
    };
    const scheduleAccept = () => {
      listener.accept().then(handleConn);
    };
    scheduleAccept();
  };

  acceptRoutine();

  while (true) {
    await env.deferred.promise;
    env.deferred = deferred(); 
    let queueToProcess = env.queue;
    env.queue = [];
    for (const ctx of queueToProcess) {
      yield ctx;
      serveContext(env, ctx.conn, ctx);
    }
  }
  listener.close();
}

async function createHTTP(
  addr: string,
  handler: (ctx) => void
) {
  const server = serve(addr);
  for await (const ctx of server) {
    await handler(ctx);
  }
}


async function loopContext(c: Conn): Promise<[Context, any]> {
  const ctx = new Context(c);
  let err: any;

  try {
    await ctx.req.getGeneral();
  } catch (e) {
    err = e;
  }

  if (err) {
    return [null, err];
  }
  
  try {
    await ctx.req.getHeaders();
  } catch (e) {
    err = e;
  }

  try {
    await ctx.req.getBodyStream();
  } catch (e) {
    err = e;
  }

  return [ctx, err];
}


export class Server {
  private _handler: (ctx: Context) => Promise<void>;
  private _isInitialized: boolean = false;
  private _isListening: boolean = false;

  createServer(handler) {
    if (this._isInitialized !== true) {
      this._handler = handler;
      this._isInitialized = true;
      return this;
    } else {
      throw new Error('The http service has been initialized');
    }
  }

  listen(addr, callback) {
    if (this._isListening !== true) {
      const handler = this._handler;
      createHTTP(addr, handler);
      callback();
      this._isInitialized = true;
    } else {
      throw new Error('The http service is already listening');
    }
  }
}


