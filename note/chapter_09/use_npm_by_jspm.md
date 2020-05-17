# Deno借助jspm使用npm

## 前言

Deno的诞生过程中，有个因素是为了抛掉 `node_modules` 的历史问题，但是不可避免的会带来暂时无法利用 `npm` 生态的遗憾。毕竟`npm`沉淀了10余年的`JS`生态，如果直接放弃是有点遗憾的。目前（截至2020年5月），`Deno`的官方标准库 `deno/std`在建设对 `Node.js` 的兼容 [deno/std/node](https://github.com/denoland/deno/blob/master/std/node/README.md)，这也对后续能否利用 `npm` 生态带来曙光。

至于目前 `Deno` 暂时无法直接使用 `npm` 生态，我们可以换种方式间接去使用，本篇是主要探讨如何在 `Deno`环境里，借助 `jspm`调用`npm`的模块能力。

## 原理

- `Deno` 自带可以通过 `URL` 来 `import` 一个 `JavaScript`或`TypeScript` 模块文件，符合`ES6`模块标准
- `jspm`是基于`SystemJS`的能力，以`npm`或`GitHub`为注册表，去将其`JavaScript`模块封装成浏览器可以直接调用`ES6`模块
- `Deno`可以借助`jspm.io`这个`jspm`直接调用在`npm`上有注册的`JavaScript`模块包
- 但是`Deno`调用的`npm`模块，必须是纯`JavaScript`或者`browser`能力的(例如: react、react-dom、lodash 之类)，暂时兼容不了带`Node.js`API的模块。


如果通过`jspm.io` 引入 `npm` 的 `lodash`模块，使用方式如下：

```js
import lodash from "https://dev.jspm.io/lodash";

const array = [1];
const result = lodash.concat(array, 2, [3], [[4]]);
console.log(result);
// export: [1, 2, 3, [4]]
```


## 使用案例

### Deno调用react的npm模块

源码地址 [https://github.com/chenshenhai/deno_note/blob/master/demo/npm/react.tsx](https://github.com/chenshenhai/deno_note/blob/master/demo/npm/react.tsx)


```js
/// <reference path="https://deno.land/x/types/react/v16.13.1/react.d.ts" />
import React from "https://dev.jspm.io/react";
import ReactDOMServer from "https://dev.jspm.io/react-dom/server";

const Module = (data: string) => {
  return (
    <div className="mod">
      <div>data: {data}</div>
    </div>
  )
}

const View = () => {
  return (
    <div className="hello">
      {Module('hello world')}
    </div>
  )
}

const html = ReactDOMServer.renderToString(View())
console.log(html)
```

- 执行代码

```sh
deno run react.tsx
```
- 结果会输出

```sh
<div class="hello" data-reactroot=""><div class="mod"><div>data: <!-- -->hello world</div></div></div>
```

#### Deno调用lodash的npm模块

源码地址 [https://github.com/chenshenhai/deno_note/blob/master/demo/npm/lodash.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/npm/lodash.ts)

```js
import lodash from "https://dev.jspm.io/lodash";

const array = [1];
const result = lodash.concat(array, 2, [3], [[4]]);
console.log(result);
```
- 执行代码

```sh
deno run lodash.ts
```
- 结果会输出

```sh
[1, 2, 3, [4]]
```

### Deno调用koa-compose的npm模块

源码地址 [https://github.com/chenshenhai/deno_note/blob/master/demo/npm/koa_compose.ts](https://github.com/chenshenhai/deno_note/blob/master/demo/npm/koa_compose.ts)

```js
import compose from "https://dev.jspm.io/koa-compose";

let middleware = [];
let context = {
  data: []
};

middleware.push(async(ctx: any, next: Function) => {
  console.log('action 001');
  ctx.data.push(2);
  await next();
  console.log('action 006');
  ctx.data.push(5);
});

middleware.push(async(ctx: any, next: Function) => {
  console.log('action 002');
  ctx.data.push(2);
  await next();
  console.log('action 005');
  ctx.data.push(5);
});

middleware.push(async(ctx: any, next: Function) => {
  console.log('action 003');
  ctx.data.push(2);
  await next();
  console.log('action 004');
  ctx.data.push(5);
});

const fn = compose(middleware);

fn(context)
  .then(() => {
    console.log('end');
    console.log('context = ', context);
  });
```
- 执行代码

```sh
deno run koa_compose.ts
```
- 结果会输出

```sh
action 001
action 002
action 003
action 004
action 005
action 006
end
context =  { data: [ 2, 2, 2, 5, 5, 5 ] }
```
