# 表单文件上传功能实现

## 前言

前几篇主要讲解 web 场景下的路由、静态资源等实现，这一篇主要讲解 web 场景下上传文件的实现。

主要是基于[《中间件式框架简单实现》](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/web_framework_middleware.md) 的中间件 web 服务上实现表单上传文件的能力。

源码地址
[https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/example.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/example.ts)

## 表单上传原理

### 表单类型 multipart/form-data

表单类型要设置成 `enctype="multipart/form-data"`

```html
<form method="POST" action="/" enctype="multipart/form-data">
  <input name="data_text" value="abc1234567" /><br/>
  <input name="image_file" type="file"  /><br/>
  <button type="submit">submit</button>
</form>
```


### HTTP请求体

表单内容经过浏览器到服务器就变成如下的HTTP请求的二进制数据流

```sh
POST / HTTP/1.1
Host: 127.0.0.1:3001
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryYVUVAJNujYItbGEK

------WebKitFormBoundaryYVUVAJNujYItbGEK
Content-Disposition: form-data; name="data_text"

abc1234567
------WebKitFormBoundaryYVUVAJNujYItbGEK
Content-Disposition: form-data; name="image_file"; filename="github-mini.jpg"
Content-Type: image/jpeg

锟斤拷锟斤拷..... (上传文件的二进制数据)
------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```

HTTP请求内容中
- 请求头 HTTP Headers
  - `Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryYVUVAJNujYItbGEK
  ` 是声明该请求为文件上传的表单类型
  - `boundary=----WebKitFormBoundaryYVUVAJNujYItbGEK` 代表了表单里每个数据的分隔符
- 请求体 HTTP Body
  - `--${boundary}` 分隔符前加两个`-`，是每个表单数据开始标志
  - `--${boundary}--` 是整个表单结束的标志
  - 在分割符内，就描述了表单每个数据的类型，名称和内容
  - 文件类型描述为 `Content-Disposition: form-data; name="xxx"; filename="xxx.xx"`
  - 文件类型 `Content-Type: image/jpeg`
  - 描述每个数据块数据后空一行，就是表单的数据内容

上传文件，就是把表单发起 `HTTP`的`POST`请求体中的二进制文件流数据解析出来，再拼接成完整二进制文件流写到服务本地。 


## 表单请求的解析

### 步骤1: 解析HTTP

利用[《中间件式框架简单实现》](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/web_framework_middleware.md) 的中间件 web 服务上实现表单上传文件的能力。
这一篇所讲的，将HTTP请求第一行(`General`)，头部(`Headers`)，和请求体(`Body Stream`)给全部解析出来

- 读取请求第一行的请求类型 `POST`
- 读取请求头的内容类型 `Content-Type`
  - 解析表单类型 `multipart/form-data`
  - 解析出表单分隔符 `boundary`

### 步骤2: 切割HTTP请求体

将请求体数据流根据分隔符 `boundary` 切割出每个数据块在内存数据流中的开始和终止的偏移量
例如:

```js
// 表单二进制数据流单个数据偏移量
interface FieldChunkOffset {
  start: number;
  end: number;
}

/**
 * 将 multipart/form-data 的表单类型按照表单的数据域
 * 切割成对应的数据缓存区/数据流
 * 
 * @param {string} boundary 表单数据的分隔符
 * @param {Uint8Array} stream 表单数据流, 也就是表单HTTP请求体
 * @return {Uint8Array[]} 返回表单每个数据的 内存区间/数据流
 */
async function parseMultipartStreamToFields(boundary: string, stream: Uint8Array): Promise<Uint8Array[]> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const newField = `--${boundary}`; // 表单数据分隔符/起始
  const end = `--${boundary}--`; // 表单终止符

  const newFieldChunk = encoder.encode(newField);
  const endChunk = encoder.encode(end);

  const bodyBuf = new Deno.Buffer(stream);
  const bufReader = new BufferReader(bodyBuf);
  let isFinish: boolean = false;

  const fieldChunkList: Uint8Array[] = [];
  const fieldOffsetList: FieldChunkOffset[] = [];
  let index: number = 0;

  // 根据分隔符和终止符
  // 来读取和计算表单内存空间/数据流里每个数据的起始和终止偏移量
  while(!isFinish) {
    const lineChunk = await bufReader.readLineChunk();
    const lineChunkLen = lineChunk.length + CRLF_LEN;
    const startIndex = index;
    const endIndex = index + lineChunkLen;

    if (lineChunk.length === endChunk.length) {
      const line: string = decoder.decode(lineChunk);
      if (line === end) {
        isFinish = true;
        if (fieldOffsetList[fieldOffsetList.length - 1]) {
          fieldOffsetList[fieldOffsetList.length - 1].end = endIndex - lineChunkLen;
        }
        break;
      }
    }

    if (lineChunk.length === newFieldChunk.length) {
      const line: string = decoder.decode(lineChunk);
      if (line === newField) {
        if (fieldOffsetList[fieldOffsetList.length - 1]) {
          fieldOffsetList[fieldOffsetList.length - 1].end = startIndex;
        }
        fieldOffsetList.push({
          start: startIndex + lineChunkLen,
          end: -1,
        });
      }
    }
    index = endIndex;
  }

  // 根据 表单内存空间/数据流里每个数据的起始和终止偏移量
  // 切割出每个数据的数据流
  fieldOffsetList.forEach((offset: FieldChunkOffset) => {
    if(offset) {
      if(offset.start >= 0 && offset.end >= 0) {
        const fieldChunk: Uint8Array = stream.subarray(offset.start, offset.end);
        fieldChunkList.push(fieldChunk);
      }
    }
  })

  return fieldChunkList;
}

```

### 步骤3: 解析HTTP请求体表单信息

- 将表单每个数据域的二进制内存数据流解析出对应类型的数据
  - 文本就解析成文本
  - 文件就解析出文件类型、文件内容的二进制数据流

```js
// 表单数据类型
export interface FormFieldData {
  name: string; // 表单数据名称
  filename?: string; // 表单文件数据名称
  type?: string; // 表单数据类型
  value: Uint8Array|string; // 表单数据值 文本string类型， 文件Uint8Array类型
}


/**
 * 解析 multipart/form-data 类型表单所有数据
 * @param {string} boundary 表单数据的分隔符
 * @param {Uint8Array} stream 表单数据流, 也就是表单HTTP请求体
 * @return {FormFieldData[]} 表单数据列表
 *  例如 [{ name: "myName", value: "helloworld" }, { name: "myFile", value: [0,1,...], type: "image/jpeg", filename: "xxx.jpg" }]
 */
export async function parseMultipartForm(boundary: string, stream: Uint8Array): Promise<FormFieldData[]> {
  const fields = await parseMultipartStreamToFields(boundary, stream);
  const dataList: FormFieldData[] = [];
  for await (const data of parseMultipartFormField(fields)) {
    dataList.push(data);
  }
  return dataList;
}


/**
 * 解析 multipart/form-data 类型表单单个数据
 * 
 * @param {string} boundary 单个表单数据的分隔符
 * @param {Uint8Array} stream 单个表单数据流, 也就是表单HTTP请求体
 * @return {FormFieldData} 单个表单数据
 *  例如文本类型 { name: "myName", value: "helloworld" }
 *  例如文件二进制数据 { name: "myFile", value: [0,1,...], type: "image/jpeg", filename: "xxx.jpg" }
 */
async function* parseMultipartFormField(fields: Uint8Array[]): AsyncGenerator<FormFieldData> {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const reader = new BufferReader(new Deno.Buffer(field));
    const contentDescChunk = await reader.readLineChunk();
    const contentDesc = decoder.decode(contentDescChunk);

    if (textFieldReg.test(contentDesc)) {
      const execRs = textFieldReg.exec(contentDesc);
      const nullLine = await reader.readLine();
      const value: string = await reader.readLine();
      if (nullLine === '') {
        const fieldData = {
          name: execRs![1],
          value,
        }
        yield fieldData
      }
    } else if (fileFieldReg.test(contentDesc)) {
      const execRs = fileFieldReg.exec(contentDesc);

      const contentTypeChunk = await reader.readLineChunk();
      const contentType = decoder.decode(contentTypeChunk);
      const typeRs = fileTypeReg.exec(contentType);

      const nullLine = await reader.readLine();
      if (nullLine === '') {
        const valueStart = (contentDescChunk.length + CRLF_LEN) + (contentTypeChunk.length + CRLF_LEN) + CRLF_LEN;
        const valueEnd = field.length - CRLF_LEN;
        const fieldData = {
          name: execRs![1],
          type: typeRs![1],
          filename: execRs![2],
          value: field.subarray(valueStart, valueEnd),
        }
        yield fieldData;
      }
      
    }
  }
  
}

```

### 步骤4: 将HTTP请求体中文件流写到本地

```js
Deno.writeFileSync(`./assets/${formData[1].filename}`, formData[1].value)
```

## 具体实现

### 实现源码讲解


#### 表单解析程序

#### 主程序

[https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/bodyparser.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/bodyparser.ts)


`./demo/web_upload/bodyparser.ts`

```js
import { BufferReader } from "./../buffer_reader/mod.ts";

const CRLF_LEN = 2;
const decoder = new TextDecoder();
const textFieldReg = /^Content-Disposition\:\sform\-data\;\sname\="([^\"]+)?"$/i;
const fileFieldReg = /^Content-Disposition\:\sform\-data\;\sname\="([^\"]+)?";\sfilename="([^\"]+)?"$/i;
const fileTypeReg = /^Content-Type\:\s([^\;]+)?$/i;

// 表单数据类型
export interface FormFieldData {
  name: string; // 表单数据名称
  filename?: string; // 表单文件数据名称
  type?: string; // 表单数据类型
  value: Uint8Array|string; // 表单数据值 文本string类型， 文件Uint8Array类型
}


/**
 * 解析 multipart/form-data 类型表单所有数据
 * @param {string} boundary 表单数据的分隔符
 * @param {Uint8Array} stream 表单数据流, 也就是表单HTTP请求体
 * @return {FormFieldData[]} 表单数据列表
 *  例如 [{ name: "myName", value: "helloworld" }, { name: "myFile", value: [0,1,...], type: "image/jpeg", filename: "xxx.jpg" }]
 */
export async function parseMultipartForm(boundary: string, stream: Uint8Array): Promise<FormFieldData[]> {
  const fields = await parseMultipartStreamToFields(boundary, stream);
  const dataList: FormFieldData[] = [];
  for await (const data of parseMultipartFormField(fields)) {
    dataList.push(data);
  }
  return dataList;
}


/**
 * 解析 multipart/form-data 类型表单单个数据
 * 
 * @param {string} boundary 单个表单数据的分隔符
 * @param {Uint8Array} stream 单个表单数据流, 也就是表单HTTP请求体
 * @return {FormFieldData} 单个表单数据
 *  例如文本类型 { name: "myName", value: "helloworld" }
 *  例如文件二进制数据 { name: "myFile", value: [0,1,...], type: "image/jpeg", filename: "xxx.jpg" }
 */
async function* parseMultipartFormField(fields: Uint8Array[]): AsyncGenerator<FormFieldData> {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const reader = new BufferReader(new Deno.Buffer(field));
    const contentDescChunk = await reader.readLineChunk();
    const contentDesc = decoder.decode(contentDescChunk);

    if (textFieldReg.test(contentDesc)) {
      const execRs = textFieldReg.exec(contentDesc);
      const nullLine = await reader.readLine();
      const value: string = await reader.readLine();
      if (nullLine === '') {
        const fieldData = {
          name: execRs![1],
          value,
        }
        yield fieldData
      }
    } else if (fileFieldReg.test(contentDesc)) {
      const execRs = fileFieldReg.exec(contentDesc);

      const contentTypeChunk = await reader.readLineChunk();
      const contentType = decoder.decode(contentTypeChunk);
      const typeRs = fileTypeReg.exec(contentType);

      const nullLine = await reader.readLine();
      if (nullLine === '') {
        const valueStart = (contentDescChunk.length + CRLF_LEN) + (contentTypeChunk.length + CRLF_LEN) + CRLF_LEN;
        const valueEnd = field.length - CRLF_LEN;
        const fieldData = {
          name: execRs![1],
          type: typeRs![1],
          filename: execRs![2],
          value: field.subarray(valueStart, valueEnd),
        }
        yield fieldData;
      }
      
    }
  }
  
}

// 表单二进制数据流单个数据偏移量
interface FieldChunkOffset {
  start: number;
  end: number;
}


/**
 * 将 multipart/form-data 的表单类型按照表单的数据域
 * 切割成对应的数据缓存区/数据流
 * 
 * @param {string} boundary 表单数据的分隔符
 * @param {Uint8Array} stream 表单数据流, 也就是表单HTTP请求体
 * @return {Uint8Array[]} 返回表单每个数据的 内存区间/数据流
 */
async function parseMultipartStreamToFields(boundary: string, stream: Uint8Array): Promise<Uint8Array[]> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const newField = `--${boundary}`; // 表单数据分隔符/起始
  const end = `--${boundary}--`; // 表单终止符

  const newFieldChunk = encoder.encode(newField);
  const endChunk = encoder.encode(end);

  const bodyBuf = new Deno.Buffer(stream);
  const bufReader = new BufferReader(bodyBuf);
  let isFinish: boolean = false;

  const fieldChunkList: Uint8Array[] = [];
  const fieldOffsetList: FieldChunkOffset[] = [];
  let index: number = 0;

  // 根据分隔符和终止符
  // 来读取和计算表单内存空间/数据流里每个数据的起始和终止偏移量
  while(!isFinish) {
    const lineChunk = await bufReader.readLineChunk();
    const lineChunkLen = lineChunk.length + CRLF_LEN;
    const startIndex = index;
    const endIndex = index + lineChunkLen;

    if (lineChunk.length === endChunk.length) {
      const line: string = decoder.decode(lineChunk);
      if (line === end) {
        isFinish = true;
        if (fieldOffsetList[fieldOffsetList.length - 1]) {
          fieldOffsetList[fieldOffsetList.length - 1].end = endIndex - lineChunkLen;
        }
        break;
      }
    }

    if (lineChunk.length === newFieldChunk.length) {
      const line: string = decoder.decode(lineChunk);
      if (line === newField) {
        if (fieldOffsetList[fieldOffsetList.length - 1]) {
          fieldOffsetList[fieldOffsetList.length - 1].end = startIndex;
        }
        fieldOffsetList.push({
          start: startIndex + lineChunkLen,
          end: -1,
        });
      }
    }
    index = endIndex;
  }

  // 根据 表单内存空间/数据流里每个数据的起始和终止偏移量
  // 切割出每个数据的数据流
  fieldOffsetList.forEach((offset: FieldChunkOffset) => {
    if(offset) {
      if(offset.start >= 0 && offset.end >= 0) {
        const fieldChunk: Uint8Array = stream.subarray(offset.start, offset.end);
        fieldChunkList.push(fieldChunk);
      }
    }
  })

  return fieldChunkList;
}



export interface FormContentType {
  enctype: string;
  boundary: string;
}

/**
 * 解析 HTTP headers 里 Content-Type的表单类型
 * example: "multipart/form-data; boundary=----WebKitFormBoundaryk7fXm5rwGcU1OJIq"
 * return { enctype: "multipart/form-data", boundary: "----WebKitFormBoundaryk7fXm5rwGcU1OJIq" }
 * 
 * @param {string} contentType 
 * @return {FormContentType}
 */
export function parseContentType(contentType: string): FormContentType {
  const dataList: string[] = contentType.split("; ");
  const enctype = dataList[0];
  let boundary: string = '';
  if (typeof dataList[1] === "string") {
    const strList = dataList[1].split("=");
    if (strList[0] === "boundary") {
      boundary = strList[1];
    }
  }
  return {
    enctype,
    boundary,
  }
}

```



#### 例子主程序

[https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/example.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/example.ts)

`./demo/web_upload/example.ts`

```js 
import { Application } from "./../web/mod.ts";
import { parseContentType, parseMultipartForm } from "./bodyparser.ts";

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

app.use(async function(ctx, next) {
  const general = await ctx.req.getGeneral();
  const headers = await ctx.req.getHeaders();
  const bodyStream = await ctx.req.getBodyStream();

  const contentType = headers.get('Content-Type');
  let body: string = ``;
  if (general.method === 'POST') {
    const formType = parseContentType(contentType);
    const formData = await parseMultipartForm(formType.boundary, bodyStream);
    if (formData[1].value instanceof Uint8Array && formData[1].value.length > 0) {
      Deno.writeFileSync(`./assets/${formData[1].filename}`, formData[1].value)
    }
    body = JSON.stringify(formData);;
  } else {
    body = `
    <form method="POST" action="/" enctype="multipart/form-data">
      <p>data_text</p>
      <input name="data_text" value="abc1234567" /><br/>
      <p>data_image_file</p>
      <input name="image_file" type="file"  /><br/>
      <button type="submit">submit</button>
    </form>`;
  }
  ctx.res.setStatus(200);
  ctx.res.setHeader('Content-Type', 'text/html');
  ctx.res.setBody(body);
  await next();
});

app.listen(opts, function() {
  console.log("the web is starting")
});
```


### 实现效果

```js
deno --allow-net --allow-write example.ts
```

#### 浏览器访问

- [http://127.0.0.1:3001/](http://127.0.0.1:3001/)

![image](https://user-images.githubusercontent.com/8216630/70634773-c926d600-1c6d-11ea-8ac8-fc530033ffd7.png)

#### 提交表单


![image](https://user-images.githubusercontent.com/8216630/70635185-7568bc80-1c6e-11ea-86e3-6d816179c130.png)


#### 单元测试用例可查看

[https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/test.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_upload/test.ts)
