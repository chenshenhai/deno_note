#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.51.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

test('buffer_reader/example_chunk_test', async function() {
  let process = run({
    cmd: [Deno.execPath(), "run", "./demo/buffer_reader/example_chunk.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | undefined = process.stdout;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const chunk1 = await bufReader.readLineChunk();
    assertEquals(chunk1, new Uint8Array([56,10,104,101,108,108,111]));

    const chunk2 = await bufReader.readLineChunk();
    assertEquals(chunk2, new Uint8Array([119, 10 ]));
  }

  process.close();
  process.stdout && process.stdout.close();
});