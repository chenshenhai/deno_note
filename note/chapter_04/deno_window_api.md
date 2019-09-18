# window全局API

## 简介

挂载在`Deno`环境里的全局变量下的`API`，可以直接使用`API`名称引用，也可以像在浏览器一样，在`window`下读取。

在`Deno`下执行这个代码

```js
const apiList = Object.keys(window)

console.log(`Supported global API [count: ${apiList.length}]: \r\n`);
console.log(`${apiList.join(',')}`);
```

会看到支持的全局`API`的情况

![api_count](https://user-images.githubusercontent.com/8216630/62422376-43ee4c00-b6e4-11e9-945a-8e9e83e9ece2.png)

### 特性

`Deno`环境下的`window`目前使用过程中有一下特性
- 初始化挂载在`window`的全局变量由`Deno`环境处理，无需人为引用其他辅助模块或者库。
- 如果程序文件是`*.ts`文件即纯`TypeScript`代码，在`window`对象赋值新的属性，会报错抛异常。
- 如果程序文件是`*.js`文件即纯`JavaScript`代码，在`window`对象赋值新的属性，可以直接使用。

例如:

文件`helloworld.ts`，执行`helloworld.ts` 会报错异常

```js
window.helloworld = "hello world";

console.log(helloworld);
```

然而文件 `helloworld.js`，执行`helloworld.js`，会正常的执行运行打印结果

```js
window.helloworld = "hello world";

console.log(helloworld);
// export "hello world";
```



## API

> 注：以下都是基于 Deno@v0.17.0 版本支持的 API

### Deno原生 API

- libdeno
- denoMain
- Deno
- CustomEventInit
- EventInit
- workerMain

### 浏览器兼容 Web API

- window
  - [MDN文档: Web/API/window](https://developer.mozilla.org/en-US/docs/Web/API/Window/window)
- atob
  - [MDN文档: Web/API/WindowBase64/atob](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/atob)
- btoa
  - [MDN文档: Web/API/btoa](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa)
- fetch
  - [MDN文档: Web/API/Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- clearTimeout
  - [MDN文档: Web/API/clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout)
- clearInterval
  - [MDN文档: Web/API/clearInterval](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval)
- setTimeout
  - [MDN文档: Web/API/setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
- setInterval
  - [MDN文档: Web/API/setInterval](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
- location
  - [MDN文档: Web/API/Location](https://developer.mozilla.org/en-US/docs/Web/API/Location)
- onload
  - [MDN文档: Web/API/load_event](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)
- crypto
  - [MDN文档: Web/API/crypto](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)
- Blob
  - [MDN文档: Web/API/Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- CustomEvent
  - [MDN文档: Web/API/CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent)
- Event
  - [MDN文档: Web/API/Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)
- EventTarget
  - [MDN文档: Web/API/EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- URL
  - [MDN文档: Web/API/URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
- URLSearchParams
  - [MDN文档: Web/API/URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- Headers
  - [MDN文档: Web/API/Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)
- FormData
  - [MDN文档: Web/API/FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- TextEncoder
  - [MDN文档: Web/API/TextEncoder](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder)
- TextDecoder
  - [MDN文档: Web/API/TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)
- performance
  - [MDN文档: Web/API/Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance)



