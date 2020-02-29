const decoder = new TextDecoder();
const encoder = new TextEncoder();

// 数据流的原字符串
const str = `hello\r\nworld\r\n!\r\n`;

// 回车符
const CR = "\r".charCodeAt(0); 
// 换行符
const LF = "\n".charCodeAt(0);

// 待按行读取的数据流
const stream = encoder.encode(str);
// 待按行读取的数据缓存
const reader = new Deno.Buffer(stream);
const size = 8;

// 用来读取的数据的缓冲区
let chunk: Uint8Array = new Uint8Array(0);

// 数据读取是否到结尾
let eof = false;
// 缓冲区数据读取的当前的索引
let currentReadIndex = 0;

/** 
 * 是否为回车换行字符
 * @param {Uint8Array} buf
 * @return {bollean}
 * */ 
function isCRLF(buf: Uint8Array): boolean {
  return buf.byteLength === 2 && buf[0] === CR && buf[1] === LF;
}

/** 
 * 读取缓冲区当前已经读到的数据块
 * @return {Uint8Array}
 * */
function getCurrent(): Uint8Array {
  return chunk.subarray(currentReadIndex);
}


/** 
 * 读取一个数据块
 * @return {Promise<boolean>}
 * */
async function readChunk(): Promise<boolean> {
  let isNeedRead = false;
    
  if (eof === true) {
    return isNeedRead;
  }
  const tempChunk = new Uint8Array(size);
  const result = await reader.read(tempChunk);

  const nread: number = result === Deno.EOF ? 0 : result;
  if (nread === 0) {
    eof = true;
    return isNeedRead;
  } else {
    isNeedRead = true;
  }

  let remainLength = 0;
  if (chunk.byteLength > 0 ) {
    remainLength = chunk.byteLength - currentReadIndex
  }

  const newChunk = new Uint8Array(remainLength + nread);
  newChunk.set(chunk.subarray(currentReadIndex), 0);
  newChunk.set(tempChunk.subarray(0, nread), remainLength);
  currentReadIndex = 0;
  chunk = newChunk;
  return isNeedRead;
}

/** 
 * 读取一行
 * @return {Promise<string>}
 * */
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
  const line3 = await readLine();
  console.log(line3); // export: "!"
  const line4 = await readLine();
  console.log(line4); // export: ""
  const line5 = await readLine();
  console.log(line5); // export: ""
}

main();