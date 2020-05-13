#!/usr/bin/env deno --allow-all
import { assertEquals } from "https://deno.land/std@0.50.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

async function sleep(time: number = 10): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time)
  })
}


test('import_maps/mod_test', async function() {
  let process = run({
    cwd: "./demo/import_maps",
    cmd: [
      Deno.execPath(), 
      "run", "--unstable", "--importmap", "map.json",
      "mod.ts", 
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | undefined = process.stdout;
  if (buffer) {
    await sleep(2000);
    const bufReader = new BufferReader(buffer);
    const line1 = await bufReader.readLine();
    assertEquals(line1, decodeURIComponent('3%20%2B%204%20%3D%207%0A'));
    const line2 = await bufReader.readLine();
    assertEquals(line2, "");
  }

  process.close();
  process.stdout && process.stdout.close();
});