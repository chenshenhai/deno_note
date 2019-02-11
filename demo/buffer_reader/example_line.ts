import { Buffer } from "deno";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

// 回车符
const CR = "\r".charCodeAt(0); 
// 换行符
const LF = "\n".charCodeAt(0);

const str = `hello\r\nworld\r\n!\r\n`;
const stream = encoder.encode(str);
const reader = new Buffer(stream);
const size = 8;

let chunk: Uint8Array = new Uint8Array(0);


let eof = false;
let currentReadIndex = 0;

// 是否为回车换行字符
function isCRLF(buf): boolean {
  return buf.byteLength === 2 && buf[0] === CR && buf[1] === LF;
}

// 读取当前已经读到的数据索引
function getCurrent() {
  return chunk.subarray(currentReadIndex);
}

// 读取一个数据块
async function readChunk(): Promise<boolean> {
  let isNeedRead = false;
    
  if (eof === true) {
    return isNeedRead;
  }
  const tempChunk = new Uint8Array(size);
  const result = await reader.read(tempChunk);

  if (result.eof === true || result.nread === 0) {
    eof = true;
    return isNeedRead;
  } else {
    isNeedRead = true;
  }

  
  let remainLength = 0;
  if (chunk.byteLength > 0 ) {
    remainLength = chunk.byteLength - currentReadIndex
  }

  const newChunk = new Uint8Array(remainLength + result.nread);
  newChunk.set(chunk.subarray(currentReadIndex), 0);
  newChunk.set(tempChunk.subarray(0, result.nread), remainLength);
  currentReadIndex = 0;
  chunk = newChunk;
  return isNeedRead;
}

// 读取一行
async function readLine (): Promise<string>  {
  let lineBuf = new Uint8Array(0);
  while(!eof || chunk.length > 0) {
    const current = getCurrent();
    for (let i = 0; i < current.byteLength; i++) {
      if (current.byteLength <= 0) {
        continue;
      }
      const buf = current.subarray(i, i + 2);
      if (isCRLF(buf) === true) {
        lineBuf = current.subarray(0, i);
        currentReadIndex += i + 2;
        return decoder.decode(lineBuf);
      }
    }
    const result = await readChunk();
    if (!result) {
      break;
    }
  }

  const result = getCurrent();
  chunk = new Uint8Array(0);
  return decoder.decode(result);
}

async function main() {
  const line1 = await readLine();
  console.log(line1) // export:  "hello"
  const line2 = await readLine();
  console.log(line2); // export: "world"
}

main();