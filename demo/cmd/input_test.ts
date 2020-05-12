#!/usr/bin/env deno --allow-all
import { assertEquals } from "https://deno.land/std@0.50.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

test('cmd/input', async function() {
  let process = run({
    cwd: "./demo/cmd",
    cmd: [
      Deno.execPath(), 
      "run", 
      "input.ts", 
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | undefined = process.stdout;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line1 = await bufReader.readLine();
    console.log('line1 = ', line1);
    const line2 = await bufReader.readLine();
    console.log('line2 = ', line2);
    assertEquals(1, 1);
  }

  process.close();
  process.stdout && process.stdout.close();
});