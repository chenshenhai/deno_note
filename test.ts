#! /usr/bin/env deno run --allow-run --allow-net test.ts

const decoder = new TextDecoder();

const testUnitRunList = [
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./demo/buffer_reader/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./demo/request/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./demo/response/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./demo/server/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "test.ts", ".", "--cors"],
    cwd: "./demo/template/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./demo/web/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "test.ts", ".", "--cors"],
    cwd: "./demo/web_router/",
    stdout: "piped"
  },
  {
    args: ["deno", "run", "--allow-run", "--allow-net", "--allow-read", "test.ts", ".", "--cors"],
    cwd: "./demo/web_static/",
    stdout: "piped"
  },
]

async function runUnitTest(opts: Deno.RunOptions): Promise<string> {
  const unitTest = Deno.run(opts);
  const outStream = await unitTest.output();
  const output = decoder.decode(outStream);
  return output
}

async function *runAllUnitTest(optsList): AsyncIterableIterator<any[]>{
  for (let i = 0; i < optsList.length; i++) {
    let err = null;
    let log = null;
    const opts: Deno.RunOptions = optsList[i];
    try {
      log = await runUnitTest(opts);
    } catch (e) {
      err = e;
    }
    yield [err, log];
  }
}

async function main() {
  for await(const [err, log] of runAllUnitTest(testUnitRunList)) {
    if (err) {
      throw new Error(err);
    } else {
      console.log(log);
    }
  }
}

main();
