import {readDirSync, FileInfo} from 'deno';

function main(): void {
  const rs:FileInfo[] = readDirSync("./assets/");
  console.log(rs);
}

main();