# Deno目录操作API

## API使用方式

更多详细信息可参考官方API文档 [https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.DirEntry](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.DirEntry)

### 读目录

#### 同步读目录

- `Deno.readDirSync(string: dirPath)`
  - 输入类型为`string`的目录地址`dirPath`
  - 返回 类型为`Iterable<DirEntry>`的文件信息接迭代器
    - `DirEntry` 包含了判断是否为目录`isDirectory`，是否为文件`isFile`的属性

```js
// 读取相对当前目录 ./assets 的位置
// 返回 类型为 Iterable<DirEntry> 的文件信息接迭代器
//  DirEntry 包含了判断是否为目录isFile，是否为文件isFile的属性
const rs = Deno.readDirSync("./assets");
for (const dirEntry of Deno.readDirSync("./assets")) {
  console.log(dirEntry.name);
}

```

#### 异步读目录

- `Deno.readDir(string: dirPath): Promise<FileInfo[]>`
  - 输入类型为`string`的目录地址`dirPath`
  - 返回 `Promise`对象，回调数据类型为`Iterable<DirEntry>`的文件信息接迭代器
    - `DirEntry` 包含了判断是否为目录`isDirectory`，是否为文件`isFile`的属性

```js
// 读取相对当前目录 ./assets 的位置
// 返回 类型为 FileInfo[] 的文件信息数组
//  FileInfo 包含了判断是否为目录isDirectory()，是否为文件isFile()的方法
async function main() {
  const rs = await Deno.readDir("./assets");
}
main();
```


### 创建目录


#### 同步创建目录

- `Deno.mkdirSync()`
  - 输入类型为`string`的目录地址`dirPath`，就可以创建相关的目录

```ts
// 在当前路径下创建一个 名为 new_dir 的文件夹
Deno.mkdirSync("./new_dir");
```

#### 异步创建目录

- `Deno.mkdir()`
  - 输入类型为`string`的目录地址`dirPath`，就可以创建相关的目录
  - 返回一个`Promise`对象，回调为空`void`

```ts

async function main() {
  // 在当前路径下创建一个 名为 new_dir 的文件夹
  await Deno.mkdir("./new_dir");
}

main();
```




