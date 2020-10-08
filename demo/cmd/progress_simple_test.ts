#!/usr/bin/env deno --allow-all
import { assertEquals } from "https://deno.land/std@0.73.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";
import { sleep } from './util.ts';

const test = Deno.test;
const run = Deno.run;

test('cmd/progress_simple_test', async function() {
  let process = run({
    cwd: "./demo/cmd",
    cmd: [
      Deno.execPath(), 
      "run", 
      "progress_simple.ts", 
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | undefined = process.stdout;
  if (buffer) {
    await sleep(1200);
    const bufReader = new BufferReader(buffer);
    const line1 = await bufReader.readLine();
    assertEquals(line1, `[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[K▊[0C [K`);
    const line2 = await bufReader.readLine();
    assertEquals(line2, "");
  }

  process.close();
  process.stdout && process.stdout.close();
});