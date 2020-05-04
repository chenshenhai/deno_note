# Deno文件操作API

## API使用方式

更多详细信息可参考官方API文档 [https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.readFileSync](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.readFileSync)

### 读取文件

#### 同步读取文件

- `Deno.readFileSync(string: filePath)`
  - 输入文件地址(绝对地址或者相对地址) `filePath` 
  - 返回一个`Uint8Arry`类型的数据流，需要经过解码才能清楚字符串内容

```js

const bytes = Deno.readFileSync("./assets/index.txt");
// 如果内容是字符串，就需要解码处理
const text = new TextDecoder().decode(bytes);
console.log(text);
```

#### 异步读取文件

- `Deno.readFile(string: filePath):Promise<Uint8Array>`
  - 输入文件地址(绝对地址或者相对地址) `filePath` 
  - 返回一个`Promise`数据，回调数据是`Uint8Arry`类型的数据流，需要经过解码才能清楚字符串内容

```js

async function main() {
  const bytes = await Deno.readFile("./assets/index.txt");
  // 如果内容是字符串，就需要解码处理
  const text = new TextDecoder().decode(bytes);
  console.log(text);
}
main();
```

### 写文件

#### 同步写文件

- `Deno.writeFileSync(string: filePath, Uint8Arry: data)`
  - 输入文件地址(绝对地址或者相对地址) `filePath` 
  - 输入待写入类型为`Uint8Arry`的文件内容`data`

```js
const data = new TextEncoder().encode("this is writing result!");
Deno.writeFileSync("./assets/result.txt", data);
```

#### 异步写文件

- `Deno.writeFile(string: filePath, Uint8Arry: data): Promise<void>`
  - 输入文件地址(绝对地址或者相对地址) `filePath` 
  - 输入待写入类型为`Uint8Arry`的文件内容`data`
  - 返回一个`Promise`对象，空回调`void`

```js

async function main() {
  const data = new TextEncoder().encode("this is writing result!");
  await Deno.writeFile("./assets/result.txt", data);
}

main();
```




