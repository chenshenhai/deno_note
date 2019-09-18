# 文件操作

## 前言

作为文件系统的读写操作，`Deno` 提供了比较实用的`API`，无需过多的讲解，直接看例子源码就可以了解怎么实现操作。


## 读文件操作

```js
import {readFileSync} from 'deno';

async function main(): Promise<void> {
  const decoder = new TextDecoder("utf-8");
  const bytes = readFileSync("./assets/index.txt");
  const text = decoder.decode(bytes);
  console.log(text);
}

main();
```

## 写文件操作

```js
import {writeFileSync} from 'deno';

const encoder = new TextEncoder();

function main(): void {
  const data = encoder.encode("this is writing result!");
  writeFileSync("./assets/result.txt", data);
}

main();
```

## 目录读操作

```js
import {readDirSync, FileInfo} from 'deno';

function main(): void {
  const rs:FileInfo[] = readDirSync("./assets/");
  console.log(rs);
}

main();
```

## 目录写操作

```js
import {mkdirSync, } from 'deno';

async function main(): Promise<void> {
  mkdirSync("./assets/new_dir");
}

main();
```