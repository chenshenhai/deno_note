# Deno使用import-maps


## 什么是 import maps

从 WIGC 小组的介绍 [github.com/WICG/import-maps](https://github.com/WICG/import-maps) 中可以看出 `import-maps` 是一种W3C的标准，可以在浏览器里作用，具体作用目的如下描述:

> This proposal allows control over what URLs get fetched by JavaScript import statements and import() expressions. This allows "bare import specifiers", such as import moment from "moment", to work.

可以理解是，允许控制JavaScript `import`和`import()` 获取模块的来源路径

- 例如 在网页上有这个`import-maps`配置

```html
<script type="importmap">
{
  "imports": {
    "react": "https://cdn.bootcss.com/react/16.10.2/cjs/react.development.js",
    "lodash": "https://cdn.bootcss.com/react-dom/16.10.2/cjs/react-dom-server.browser.development.js"
  }
}
</script>
```

- 就可以在同个页面其他`ES6`模块标签里直接 `import react from "react"`

```html
<script type="module">
  import React from "react";
  import ReactDOM from "react-dom";

  class App extends React.Component {
    render() {
      return <div>Hello {this.props.name}</div>;
    }
  }

  ReactDOM.render(
    <Hello name="React" />,
    document.getElementById('app')
  );
<script>
```

## 如何在Deno中使用 import-maps

### Deno对import-maps的支持程度

`Deno`在`v0.9.0`版本就支持了`import-maps`功能，经过多次迭代，目前已经完全支持了该能力。

## 如何在Deno中使用

### demo例子

[https://github.com/chenshenhai/deno_note/blob/master/demo/import_maps/](https://github.com/chenshenhai/deno_note/blob/master/demo/import_maps/)

### 结构目录

```sh
.
├── add.ts # 待使用的库函数文件
├── map.json # import-maps 配置
└── mod.ts  # 模块入口文件
```


- map.json 文件配置

```json
{
  "imports": {
    "util/add": "./add.ts"
  }
}
```

- mod.ts 模块入口文件

```js
import { add } from "util/add";

console.log(`3 + 4 = ${ add(3, 4)}`)
```

- 使用的库函数文件

```js
export function add(x: number, y: number): number {
  return x + y;
}
```

在当前目录下执行

```sh
deno run --importmap map.json mod.ts
```

就可以运行起 `import-maps` 对 mod.ts 引用的配置

![image](https://user-images.githubusercontent.com/8216630/71538696-450d6780-296a-11ea-8b33-619e83a2af87.png)

