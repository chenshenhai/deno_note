# 中间件-静态资源实现

## 前言

前一篇文章 [6.1 中间件式框架简单实现](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/01.md) 讲述了如何实现一个  `Deno`版 `Koa.js`。本篇就主要讲解，基于上述的中间件框架扩展的静态资源中间件的实现。

## 实现过程

- 配置过程
  - 配置静态资源绝对目录地址 `baseDir`
  - 配置静态资源特定前缀 `prefix`
- 运行过程
  - 判断是否为 `GET` 类型的请求
  - 过滤处理路径，防止访问设定资源路径外的资源
  - 读取静态文件，根据是否存在状态做对应的响应处理

## 具体实现

#### 源码地址

[https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/mod.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/mod.ts)

#### 源码讲解

demo/web_static/mod.ts

```js
const readFileSync = Deno.readFileSync;
const lstatSync = Deno.lstatSync

const decoder = new TextDecoder();

interface ServeOptions {
  prefix: string;
}

/**
 * 读取静态文件
 * @param {string} fullFilePath 文件的绝对路径
 * @return {string}
 */
function renderFile( fullFilePath: string) {
  const bytes = readFileSync(fullFilePath);
  const content = decoder.decode(bytes);
  return content;
}

/**
 * 过滤静态资源请求路径
 * @param {string} path HTTP请求路径
 * @param {object} opts HTTP请求路径需要操作的参数
 *  opts.prefix {string} 清除掉HTTP路径的前缀
 * @param {string} 返回过滤掉的HTTP路径
 */
function pathFilter(path: string, opts?: ServeOptions) {
  const prefix = (opts && opts.prefix) ? opts.prefix : "";
  let result = "";
  result = path.replace(prefix, "");
  // 过滤掉路径里 ".." "//" 字符串，防止越级访问文件夹
  result = result.replace(/[\.]{2,}/ig, "").replace(/[\/]{2,}/ig, "/");
  return result;
}

/**
 * 静态服务中间件生成函数
 * @param baseDir 静态资源目录文件路径
 * @param options 静态资源配置参数
 *  opts.prefix {string} 清除掉HTTP路径的前缀
 * @param {function} 中间件函数
 */
function serve(baseDir: string, options?: ServeOptions): Function {
  return async function(ctx, next) {
    await next();
    const {req, res} = ctx;
    const gen = await req.getGeneral() || {};
    const pathname = gen.pathname;
    if ( options && typeof options.prefix === "string" && pathname.indexOf(options.prefix) === 0 ) {
      const path = pathFilter(pathname, options);
      const fullPath = `${baseDir}${path}`;
      let result = `${path} is not found!`;
      try {
        const stat = lstatSync(fullPath);
        // 判断是否为文件路径
        if (stat.isFile() === true) {
          result = renderFile(fullPath);
          res.setStatus(200);
        }
      } catch (err) {
        // throw new Error(err);
      }
      res.setBody(`${result}`);
      res.setFinish();
    }
  };
}

export const staticServe = serve;

```

### 使用例子

#### 使用源码

[https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/example.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/example.ts)

demo/web_static/example.ts

```js
import { Application } from "./../web/mod.ts";
import { staticServe } from "./mod.ts";

const cwd = Deno.cwd

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "0.0.0.0",
  port: 3001
}
const baseDir = [cwd(), "public"].join("/");

const staticMiddleware = staticServe(baseDir, {prefix: `/static-file`});

app.use(staticMiddleware);

app.listen(opts, function(){
  console.log(`listening on ${opts.hostname}:${opts.port}`);
});
```

#### 执行结果

```sh
deno run --allow-read --allow-net example.ts 
```

#### 结果显示

- 访问 [http://0.0.0.0:3001/static-file/index.html](http://0.0.0.0:3001/static-file/index.html)

![web_static](https://user-images.githubusercontent.com/8216630/53965401-24022e80-412c-11e9-9d87-2a4b9a2de725.jpg)


## 测试

### 单元测试

- 测试服务
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/test_server.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/test_server.ts)
- 单元测试核心
  - [https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/test.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/web_static/test.ts)

