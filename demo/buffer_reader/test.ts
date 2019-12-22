import { test, runTests } from "https://deno.land/std/testing/mod.ts";
import { assertEquals, equal } from "https://deno.land/std/testing/asserts.ts";
import { BufferReader } from "./mod.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

test(async function testBufferReaderMinSize() {
  const strList = [
    "",
    "hello",
    "world",
    "!",
    "",
    "",
  ];
  const str = strList.join(`\r\n`);
  const stream = encoder.encode(str);
  const buf = new Deno.Buffer(stream);
  const bufReader : BufferReader = new BufferReader(buf, 4);
  let readLineIndex = 0;
  while(!bufReader.isFinished()) {
    const line = await bufReader.readLine();
    equal(line, strList[readLineIndex]);
    readLineIndex ++;
  }
});


test(async function testBufferReaderMaxSize() {
  const strList = [
    "",
    "hello",
    "world",
    "!",
    "",
    "",
  ];
  const str = strList.join(`\r\n`);
  const stream = encoder.encode(str);
  const buf = new Deno.Buffer(stream);
  const bufReader : BufferReader = new BufferReader(buf, 4096);
  let readLineIndex = 0;
  while(!bufReader.isFinished()) {
    const line = await bufReader.readLine();
    equal(line, strList[readLineIndex]);
    readLineIndex ++;
  }
});

test(async function testBufferReaderCustomSize() {
  const strList = [
    "\r\n",
    "hello",
    "\r\n",
    "world",
    "\r\n",
    "!",
    "\r\n",
    "ha!"
  ];
  const str = strList.join("");
  const stream = encoder.encode(str);
  const buf = new Deno.Buffer(stream);
  const bufReader : BufferReader = new BufferReader(buf, 4096);
  const line1 = await bufReader.readLine();
  equal(line1, "");
  const line2 = await bufReader.readLine();
  equal(line2, "hello");
  const customChunk = await bufReader.readCustomChunk(8);
  const customStr = decoder.decode(customChunk);
  equal(customStr, "world\r\n!");
});



