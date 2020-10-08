#!/usr/bin/env deno --allow-run --allow-net
import { assertEquals, equal } from "https://deno.land/std@0.73.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";

const test = Deno.test;
const run = Deno.run;

test('cli/install_test', async function() {
  let process = run({
    cwd: "./demo/cli",
    cmd: [
      Deno.execPath(), 
      "run", 
      "--allow-env", "--allow-write", "--allow-read", "--allow-run",
      "install.ts", 
      "--", ".", "--cors"
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | undefined = process.stdout;
  if (buffer) {
    const bufReader = new BufferReader(buffer);
    const line1 = await bufReader.readLine();
    assertEquals(line1, '');
    const line2 = await bufReader.readLine();
    assertEquals(line2, '[INFO]: denocli is installed successfully!');
    const line3 = await bufReader.readLine();
    assertEquals(line3, `

    export PATH=$PATH:${Deno.env.get('HOME')}/.deno_cli/bin  >> ~/.bash_profile`);
    const line4 = await bufReader.readLine();
    assertEquals(line4, `
    source  ~/.bash_profile`);
  }

  process.close();
  process.stdout && process.stdout.close();
});