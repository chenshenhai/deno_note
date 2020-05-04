# Deno删除操作API

## API使用方式

更多详细信息可参考官方API文档 [https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.removeSync](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.removeSync)


### 同步删除操作

- `Deno.removeSync(path, {recursive})`
  - `path`为要删除的地址
  - 参数配置里的`recursive`为`boolean`类型
    - 当`recursive`设置为`true`时候，即使`path`路径下是非空目录，也会递归删除掉目录里的所有内容。

```js
Deno.removeSync('./assets/hello/world', {recursive: false})
```

### 异步删除操作

- `Deno.remove(path, {recursive})`
  - `path`为要删除的地址
  - 参数配置里的`recursive`为`boolean`类型
    - 当`recursive`设置为`true`时候，即使`path`路径下是非空目录，也会递归删除掉目录里的所有内容。
   返回一个`Promise`对象，回调为空`void`

```js
async function main() {
  await Deno.remove('./assets/hello/world', {recursive: false});
}
main();
```