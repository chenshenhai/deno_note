import {readDirSync, FileInfo} from 'deno';

async function read(path: string): Promise<FileInfo[]> {
  const result = readDirSync(path);
  return result;
}

async function main(): Promise<void> {
  const rs = await read("./assets/");
  console.log(rs);
}

main();