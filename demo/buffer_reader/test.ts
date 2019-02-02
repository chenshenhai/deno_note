import { Buffer } from "deno";
import { test, assert, equal, runTests } from "https://deno.land/x/testing/mod.ts";
import { BufferReader, BufReader } from "./mod.ts";

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
  const buf = new Buffer(stream);
  const bufReader : BufReader = new BufferReader(buf, 4);
  let readLineIndex = 0;
  while(!bufReader.isFinished()) {
    const line = await bufReader.readLine();
    assert.equal(line, strList[readLineIndex]);
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
  const buf = new Buffer(stream);
  const bufReader : BufReader = new BufferReader(buf, 4096);
  let readLineIndex = 0;
  while(!bufReader.isFinished()) {
    const line = await bufReader.readLine();
    assert.equal(line, strList[readLineIndex]);
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
  const buf = new Buffer(stream);
  const bufReader : BufReader = new BufferReader(buf, 4096);
  const line1 = await bufReader.readLine();
  assert.equal(line1, "");
  const line2 = await bufReader.readLine();
  assert.equal(line2, "hello");
  const customChunk = await bufReader.readCustomChunk(8);
  const customStr = decoder.decode(customChunk);
  assert.equal(customStr, "world\r\n!");
});

runTests();

