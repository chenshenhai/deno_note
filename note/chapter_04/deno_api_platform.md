# Deno平台API

## API 使用方式

更多详细信息可参考官方API文档 [https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.build](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.build)


- `Deno.build` 会输出一个对象 `{arch, os}`
  - `arch {string}` 操作系统的CPU 架构，例如 x64是64位
  - `os {string}` 操作系统的平台名称
    - darwin: 苹果Mac OS系统
    - win: Windows 系统
    - linux: Linux 系统

```js
console.log(Deno.build);

// export: 
/* 
{
  // 操作系统的CPU 架构，例如 x64是64位
  arch: "x64";

  // 操作系统的平台名称
  // darwin: 苹果Mac OS系统
  // win: Windows 系统
  // linux: Linux 系统
  os: "darwin" | "linux" | "windows";
}
*/
 
 
```

