#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.73.0/testing/asserts.ts";
import { BufferReader } from "./../buffer_reader/mod.ts";

const testSite = "http://127.0.0.1:3001";
const test = Deno.test;

let httpServer: Deno.Process;

async function startHTTPServer() {
  httpServer = Deno.run({
    cmd: [Deno.execPath(), "run", "--allow-net", "--allow-read",  "./demo/web_upload/test_server.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer = httpServer.stdout;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line = await bufReader.readLine();
    equal("listening on 127.0.0.1:3001", line)
  }
  
}

async function closeHTTPServer() {
  httpServer.close();
  await Deno.readAll(httpServer.stdout!);
  const stdout = httpServer.stdout as Deno.Reader & Deno.Closer | null;
  stdout!.close();
}

test('testMultipart', async function(): Promise<void> {
  await startHTTPServer();
  const multipartBody = `------WebKitFormBoundaryF2FPVKMYJmaBhBnJ\r\nContent-Disposition: form-data; name="a"\r\n\r\n001\r\n------WebKitFormBoundaryF2FPVKMYJmaBhBnJ\r\nContent-Disposition: form-data; name="b"; filename="file.txt"\r\nContent-Type: text/plain\r\n\r\nhello world!\r\nhello deno!\r\n------WebKitFormBoundaryF2FPVKMYJmaBhBnJ--\r\n`;

  try {
    const res = await fetch(
      `${testSite}/multipart`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "multipart/form-data; boundary=----WebKitFormBoundaryF2FPVKMYJmaBhBnJ"
        },
        redirect: "follow",
        referrer: "no-referrer",
        body: multipartBody
      }
    );
    const expectData = [{"name":"a","value":"001"},{"name":"b","type":"text/plain","filename":"file.txt","value":{"0":104,"1":101,"2":108,"3":108,"4":111,"5":32,"6":119,"7":111,"8":114,"9":108,"10":100,"11":33,"12":13,"13":10,"14":104,"15":101,"16":108,"17":108,"18":111,"19":32,"20":100,"21":101,"22":110,"23":111,"24":33}}];
    const bodyData = await res.json();
    assertEquals(bodyData, expectData);
  } finally {
    await closeHTTPServer();
  }
});
