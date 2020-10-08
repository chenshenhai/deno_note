#!/usr/bin/env deno --allow-all
import { assertEquals } from "https://deno.land/std@0.73.0/testing/asserts.ts";

import { BufferReader } from "./../buffer_reader/mod.ts";
import { sleep } from './util.ts';

const test = Deno.test;
const run = Deno.run;

test('cmd/output_test', async function() {
  let process = run({
    cwd: "./demo/cmd",
    cmd: [
      Deno.execPath(), 
      "run", 
      "output.ts", 
    ],
    stdout: "piped"
  });
  const buffer: (Deno.Reader & Deno.Closer) | undefined = process.stdout;
  if (buffer) {
    await sleep(2100);
    const bufReader = new BufferReader(buffer);
    const line1 = await bufReader.readLine();
    assertEquals(line1, `[0D [K 0%[11D [K 1%[12D [K 2%[12D [K 3%[12D [K 4%[12D [K 5%[12D [K 6%[12D [K 7%[12D [K 8%[12D [K 9%[12D [K 10%[13D [K 11%[13D [K 12%[13D [K 13%[13D [K 14%[13D [K 15%[13D [K 16%[13D [K 17%[13D [K 18%[13D [K 19%[13D [K 20%[13D [K 21%[13D [K 22%[13D [K 23%[13D [K 24%[13D [K 25%[13D [K 26%[13D [K 27%[13D [K 28%[13D [K 29%[13D [K 30%[13D [K 31%[13D [K 32%[13D [K 33%[13D [K 34%[13D [K 35%[13D [K 36%[13D [K 37%[13D [K 38%[13D [K 39%[13D [K 40%[13D [K 41%[13D [K 42%[13D [K 43%[13D [K 44%[13D [K 45%[13D [K 46%[13D [K 47%[13D [K 48%[13D [K 49%[13D [K 50%[13D [K 51%[13D [K 52%[13D [K 53%[13D [K 54%[13D [K 55%[13D [K 56%[13D [K 57%[13D [K 58%[13D [K 59%[13D [K 60%[13D [K 61%[13D [K 62%[13D [K 63%[13D [K 64%[13D [K 65%[13D [K 66%[13D [K 67%[13D [K 68%[13D [K 69%[13D [K 70%[13D [K 71%[13D [K 72%[13D [K 73%[13D [K 74%[13D [K 75%[13D [K 76%[13D [K 77%[13D [K 78%[13D [K 79%[13D [K 80%[13D [K 81%[13D [K 82%[13D [K 83%[13D [K 84%[13D [K 85%[13D [K 86%[13D [K 87%[13D [K 88%[13D [K 89%[13D [K 90%[13D [K 91%[13D [K 92%[13D [K 93%[13D [K 94%[13D [K 95%[13D [K 96%[13D [K 97%[13D [K 98%[13D [K 99%[0C [K`);
    const line2 = await bufReader.readLine();
    assertEquals(line2, "")
  }

  process.close();
  process.stdout && process.stdout.close();
});