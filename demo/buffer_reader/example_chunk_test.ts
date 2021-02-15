#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.87.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

test('buffer_reader/example_chunk_test', async function() {
  let process = run({
    cmd: [Deno.execPath(), "run", "./demo/buffer_reader/example_chunk.ts", "--", ".", "--cors"],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | null = process.stdout as (Deno.Reader & Deno.Closer) | null;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const chunk1 = await bufReader.readLineChunk();
    assertEquals(chunk1, new Uint8Array([
      27, 91, 51, 51, 109, 56,
      27, 91, 51, 57, 109, 10,
      104, 101, 108, 108, 111
    ]));

    const chunk2 = await bufReader.readLineChunk();
    assertEquals(chunk2, new Uint8Array([119, 10 ]));
  }

  process.close();
  process.stdout && process.stdout.close();
});