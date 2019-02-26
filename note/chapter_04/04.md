# Deno平台API

## API 使用方式

- `Deno.platform` 会输出一个对象 `{arch, os}`
  - `arch {string}` 操作系统的CPU 架构，例如 x64是64位
  - `os {string}` 操作系统的平台名称
    - mac: 苹果Mac OS系统
    - win: Windows 系统
    - linux: Linux 系统

```js
console.log(Deno.platform);

// export: 
/* 
{
  // 操作系统的CPU 架构，例如 x64是64位
  arch: "x64";

  // 操作系统的平台名称
  // mac: 苹果Mac OS系统
  // win: Windows 系统
  // linux: Linux 系统
  os: "mac" | "win" | "linux";
}
*/
 
 
```

