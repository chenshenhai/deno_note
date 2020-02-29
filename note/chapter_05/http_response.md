# 原生Deno处理HTTP响应

## 前言

前面的文章讲述了[5.7 原生Deno处理HTTP请求](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/08.md)，有`HTTP`请求，必须有`HTTP`响应。对比于`HTTP`请求操作，`HTTP`的响应操作会比较简单，因为只要对`HTTP`响应报文有了解的，按照报文的响应行，响应头和响应体按照顺序依次写入`TCP`对话连接，最后关闭`TCP`对话连接，就完成了次`HTTP`的响应过程。

## 实现原理

- `TCP`对话写入状态行
  - 协议
  - 状态码
  - 状态结果
- `TCP`对话写入响应头
  - 响应体长度
  - 其他响应信息
- `TCP`对话写入空行作为响应头和响应体的间隔
- `TCP`对话写入响应体
- `TCP`对话关闭

## 最简单例子

### 最简源码

#### 具体代码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/response/example_sample.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/response/example_sample.ts)

#### 具体代码讲解

`./demo/response/example_sample.ts`

```js
const listen = Deno.listen;

/**
 * HTTP响应操作
 * @param conn {Conn}
 */
async function response(conn: Deno.Conn) {
  const encoder = new TextEncoder();
  // 准备响应体数据流
  const bodyStr = "hello world";
  const body = encoder.encode(bodyStr);

  // TCP对话连接 写入响应行
  //    协议: HTTP/1.1
  //    状态码: 200
  //    状态结果: OK
  await conn.write(encoder.encode('HTTP/1.1 200 OK\r\n'));
  // TCP对话连接 写入响应头
  //   响应内容长度: content-length (如果是非按数据块返回的，就必须声明内容长度)
  //   其他响应头信息
  await conn.write(encoder.encode(`content-length: ${body.byteLength}\r\n`));
  await conn.write(encoder.encode(`content-xxxxxxx: abcdefg12345\r\n`));
  // TCP对话连接 写入空行，区分响应头和响应体
  await conn.write(encoder.encode('\r\n'));
  // TCP对话连接 写入响应体
  await conn.write(body);
  conn.close();
}

/**
 * HTTP服务
 * @param addr {string}
 */
async function server(opts: Deno.ListenOptions) {
  // 创建TCP服务
  const listener = listen(opts);
  console.log(`listening on ${opts.hostname}:${opts.port}`);
  // 死循环监听TCP请求
  while (true) {
    // 等待TCP连接
    const connection = await listener.accept();
    // 执行响应
    response(connection);
  }
}

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}
server(opts);
```

#### 浏览器验证

- 启动代码
```
deno run example_sample.ts
```
- 浏览器访问 [http://127.0.0.1:3001/](http://127.0.0.1:3001/)

## 优化实现

从上述的实现，可以看到`Deno`实现响应的操作就只有按部就班的短短几步，但是在现实项目中，响应的操作更加复杂，我们可以把对应的操作进行封装优化。

### 实现代码

#### 具体代码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/response/mod.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/response/mod.ts)

#### 具体代码讲解

`./demo/response/mod.ts`

```js
const encoder = new TextEncoder();
const CRLF = "\r\n";

// 响应码对应信息
const statusMap: {[key: string]: string} = {
  "200": "OK",
  "404": "Not Found",
  "500": "Server Error",
  "unknown": "Unknown Error"
  // TODO ....
  // 其他状态码信息
}

export interface Response {
  setHeader(key: string, val: string): boolean;
  getHeaders(): Headers;
  setStatus(code: number): boolean;
  getStatus(): number;
  setBody(body: string): boolean;
  getBody(): string;
  flush(): Promise<number>;
}

export class ResponseWriter implements Response {
  private _conn: Deno.Conn;
  private _status: number = 404;
  private _body: string = "";
  private _headers: Headers = new Headers();

  constructor(conn: Deno.Conn) {
    this._conn = conn;
  }

  /**
   * 设置响应头信息
   * @param {string} key 响应头信息 key
   * @param {string} val 响应头信息 值
   * @return {boolean} 是否设置成功
   * */
  setHeader(key: string, val: string): boolean {
    try {
      if (this._headers.has(key)) {
        this._headers.set(key, val);
      } else {
        this._headers.append(key, val);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * 获取所有响应头信息
   * @return {Headers}
   * */
  getHeaders() {
    return this._headers;
  }

  /**
   * 设置响应体信息
   * @param {string} body 响应体信息
   * @return {boolean} 是否设置成功
   * */
  setBody(body: string) {
    try {
      this._body = body;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * 获取所有响应状态码
   * @return {number}
   * */
  getStatus() {
    return this._status;
  } 

  /**
   * 获取请求体
   * @return {string}
   * */
  getBody(): string {
    return this._body;
  }

  /**
   * 设置状态码
   * @param {number} status
   * @return {boolean} 是否设置成功
   * */
  setStatus(status: number) {
    try {
      this._status = status;
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * 响应信息写入对话
   * @return {number} 对话写入的长度
   * */
  async flush() {
    const resStream = this.createReqStream();
    const conn = this._conn;
    // TODO: 需要优化循环判断返回长度是否等于写入的数据
    const n = await conn.write(resStream);
    return n;
  }

  private createReqStream() {
    const headers = this._headers;
    const body = this._body;
    const bodyStream = encoder.encode(body);
    headers.set("content-length", `${bodyStream.byteLength}`);
    const resLines = [];
    const status = this._status;
    let statusKey: string = `${status}`;
    if (!(statusKey in statusMap)) {
      statusKey = 'unknown';
    }
    const statusVal = statusMap[statusKey];

    // TODO: HTTP目前写死 1.1版本
    resLines.push(`HTTP/1.1 ${status} ${statusVal}`);
    for ( const key of headers.keys() ) {
      const val = headers.get(key) || "";
      resLines.push(`${key}:${val}`);
    }
    resLines.push(CRLF);
    const headerStr = resLines.join(CRLF);
    const headerChunk = encoder.encode(headerStr);
    const bodyChunk = encoder.encode(body);
    const res = new Uint8Array(headerChunk.byteLength + bodyChunk.byteLength);
    res.set(headerChunk, 0);
    res.set(bodyChunk, headerChunk.byteLength);
    return res;
  }

}
```

### 具体使用例子

#### 例子代码地址
[https://github.com/chenshenhai/deno_note/blob/master/demo/response/example.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/response/example.ts)


#### 例子代码讲解

`./demo/response/example.ts`

```ts
import { Response, ResponseWriter } from "./mod.ts";

const listen = Deno.listen

async function server(opts: Deno.ListenOptions) {
  const listener = listen(opts);
  console.log(`listening on ${opts.hostname}:${opts.port}`);
  while (true) {
    const conn = await listener.accept();
    const response: Response = new ResponseWriter(conn);
    response.setBody("hello world");
    response.setStatus(200);
    const num = await response.flush();
    conn.close();
  }
}

const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}
server(opts);
```

### 实现代码的单元测试

本书的学习方式，是依据严谨的开发方式学习，每个实现的功能都必备着单元测试。对于`HTTP`响应单元测试，主要是测试是否符合输入输出的预期，所以没必要展开讲解，可以查看一下的单元测试的代码。

#### 单元测试地址

- 测试响应`JSON`类型数据服务
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/response/test_server_json.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/response/test_server_json.ts)
- 测试响应`Text`类型数据服务
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/response/test_server_text.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/response/test_server_text.ts)
- 单元测试核心
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/response/test.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/response/test.ts)
  


